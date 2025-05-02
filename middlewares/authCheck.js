const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
exports.authCheck = async (req, res, next) => {
  
  try {
    console.log("สวัสดี คุณต้องได้รับการตรวจสอบ");
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      console.log('ไม่มี token')
      return res.status(401).json({
        message: "ไม่มีโทเค็น",
      });
    }

    // แปลงโทเค็น
    const token = headerToken.split(" ")[1];
    const decode = await jwt.verify(token, process.env.SECRET);

    req.user = decode; //  ตัวแปรน้มันจะวิ่งตลอดทั่วmiddlewares
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
    });

    if (!user.enabled) {
      return res.status(400).json({
        message: "ไม่ได้",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.adminCheck = async (req, res, next) => {
  try {
    const { email } = req.user;
    const adminUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        message: "คุณไๆม่ใช่แอดมิน",
      });
    }
    next()
  } catch (error) {
    res.status(400).json({
        message : 'Server Error'
    })
  }
};
