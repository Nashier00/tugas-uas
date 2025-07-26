import express from "express";
import bcrypt from "bcrypt";
import conn from "../db/db.js";

const router = express.Router();

// semua route di sini sama seperti sebelumnya

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  conn.query(
    "INSERT INTO users SET ?",
    { name, email, password: hashed },
    (err) => {
      console.log("Error saat register:", err);
      if (err) return res.send("Error register");
      res.redirect("/");
    }
  );
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  conn.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0) return res.send("Login gagal");
      const match = await bcrypt.compare(password, results[0].password);
      if (!match) return res.send("Password salah");
      req.session.user = {
        id: results[0].id,
        name: results[0].name,
        role: results[0].role,
      };
      res.redirect("/dashboard");
    }
  );
});

// Dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const userId = req.session.user.id;

  conn.query(
    'SELECT * FROM materi WHERE status = "approved"',
    (err, results) => {
      if (err) return res.send("Error ambil data");
      res.render("dashboard", { user: req.session.user, courses: results });
    }
  );
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Tampilkan semua materi yang sudah disetujui
router.get("/my-courses", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  conn.query(
    'SELECT * FROM materi WHERE status = "approved"',
    (err, results) => {
      if (err) return res.send("Gagal mengambil data materi");
      res.render("my-courses", { materi: results });
    }
  );
});

router.get("/materi/:id", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const materiId = req.params.id;

  const materiQuery = `
    SELECT * FROM materi 
    WHERE id = ? AND status = "approved"
  `;

  const komentarQuery = `
  SELECT * FROM komentar
  WHERE materi_id = ?
  ORDER BY created_at ASC
`;

  conn.query(materiQuery, [materiId], (err, materiResults) => {
    if (err || materiResults.length === 0)
      return res.send("Materi tidak ditemukan");

    const materi = materiResults[0];

    conn.query(komentarQuery, [materiId], (err, komentarResults) => {
      if (err) {
        console.error("SQL Error komentar:", err);
        return res.send("Gagal mengambil komentar");
      }

      res.render("materi-detail", {
        user: req.session.user,
        materi,
        komentar: komentarResults,
      });
    });
  });
});

// POST komentar baru
router.post("/komentar", (req, res) => {
  const { materi_id, content } = req.body;

  const sql = "INSERT INTO komentar (materi_id, content) VALUES (?, ?)";
  conn.query(sql, [materi_id, content], (err) => {
    if (err) {
      console.error("Error insert komentar:", err);
      return res.send("Gagal kirim komentar");
    }
    res.redirect("/materi/" + materi_id);
  });
});

router.post("/komentar/:materiId", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const materiId = req.body.materi_id; // ambil dari body!
  const { content, parent_id } = req.body;
  const userId = req.session.user.id;

  const sql =
    "INSERT INTO komentar (materi_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)";
  conn.query(sql, [materiId, userId, content, parent_id || null], (err) => {
    if (err) return res.send("Gagal menyimpan komentar");
    res.redirect("/materi/" + materiId);
  });
});

// Balasan komentar
router.post("/komentar/reply", (req, res) => {
  const { materi_id, parent_id, content } = req.body;
  const sql =
    "INSERT INTO komentar (materi_id, content, parent_id) VALUES (?, ?, ?)";
  conn.query(sql, [materi_id, content, parent_id], (err) => {
    if (err) return res.send("Gagal kirim balasan");
    res.redirect("/materi/" + materi_id);
  });
});

//upload materi
// Ini versi yang TIDAK pakai user_id (karena kamu sudah menghapusnya)
router.post("/upload-materi", (req, res) => {
  const { title, description, file_path } = req.body;

  const sql = `
    INSERT INTO materi (title, description, file_path, status) 
    VALUES (?, ?, ?, 'pending')
  `;
  conn.query(sql, [title, description, file_path], (err) => {
    if (err) {
      console.error("Gagal upload materi:", err);
      return res.send("Gagal upload materi");
    }
    res.redirect("/dashboard");
  });
});

router.get("/upload-materi", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("upload-materi", { user: req.session.user });
});

//dashboard admin
router.get("/admin/approval", (req, res) => {
  conn.query(
    "SELECT * FROM materi WHERE status = 'pending'",
    (err, results) => {
      if (err) {
        console.error("Gagal ambil data:", err);
        return res.send("Gagal mengambil data materi");
      }
      console.log("Materi pending:", results);
      res.render("approval-page", {
        materiList: results, // <- INI HARUS ADA
        user: req.session.user, // boleh dihapus kalau tidak dipakai
      });
    }
  );
});

//approved atau reject
router.post("/admin/approve/:id", (req, res) => {
  const id = req.params.id;
  conn.query(
    "UPDATE materi SET status = 'approved' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.send("Gagal menyetujui");
      res.redirect("/admin/approval");
    }
  );
});

router.post("/admin/reject/:id", (req, res) => {
  const id = req.params.id;
  conn.query(
    "UPDATE materi SET status = 'rejected' WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.send("Gagal menolak");
      res.redirect("/admin/approval");
    }
  );
});

export default router;
