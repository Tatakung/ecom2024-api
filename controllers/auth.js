const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    // 1.เช็คึ validate
    if (!email) {
      return res.status(400).json({
        message: "คุณไม่ได้กรอกอีเมล กรุณากรอกอีเมล",
      });
    }
    if (!password) {
      return res.status(400).json({
        message: "คุณไม่ได้กรอกรหัสผ่าน",
      });
    }
    // 2.เช็คในฐานข้อมูล
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      return res.status(500).json({
        message: "อีเมลนี้ถูกใช้แล้ว",
      });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: email,
        password: hashpassword,
      },
    });

    res.json({
      message: "สำเร็จ",
    });
  } catch (error) {
    console.log(error);
    res
      .json({
        message: "Server Error",
      })
      .status(500);
  }
};

exports.login = async (req, res) => {
  console.log("กำลังเข้า");
  try {
    console.log("สวัสดี ยินดีต้อนรับสู่ login");
    console.log("ค่าที่req.bodyส่งมาคือ", req.body);
    const { email, password } = req.body;
    console.log("อีเมล", email);
    console.log("รหัสผ่านที่ส่งมาคือ", password);
    // 1.เช็ค email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user || !user.enabled) {
      return res
        .json({
          message: "ไม่พบอีเมล",
        })
        .status(400);
    }
    // 2.เช็ครหัสผ่าน
    const isMath = await bcrypt.compare(password, user.password);
    if (!isMath) {
      return res
        .json({
          message: "รหัสผ่านของคุณไม่ถูกต้อง",
        })
        .status(500);
    }

    // 3.เช็ค payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // 4.สร้าง token
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(400).json({
          message: "Server Error5555",
        });
      } else {
        res.json({ payload, token, message: "เข้าสู่ระบบสำเร็จ" });
      }
    });
  } catch (error) {
    console.log("eree ส่วนของ catch");
    console.log(error);
    res.json({
      message: "Server Error",
    });
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Server Error",
    });
  }
};
