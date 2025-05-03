const prisma = require("../config/prisma");
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });

    res.json(category);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Server Error",
    });
  }
};
// exports.list = async (req, res) => {
//   try {
//     const category = await prisma.category.findMany();
//     res.json(category);
//     // res.send('สวัสดีจร้า')
//   } catch (error) {
//     console.log(error);
//     res.json({
//       message: "Server Errorมากๆ555",
//     });
//   }
// };

exports.list = async (req, res) => {
  try {
    const category = await prisma.category.findMany();
    if (category) {
      res.json({ categories: category });
    } else {
      res.send("ไม่มีข้อมูลหรือเชื่อมต่อข้อมูลไม่ได้");
    }
  } catch (error) {
    console.error("🔥 Prisma Error:", error); // เพิ่ม log ที่ชัดเจน
    res.status(500).json({
      message: "Server Errorมากๆ555",
      error: error.message, // <-- แสดง error message ตรงนี้
    });
  } finally {
    // Disconnect after query
    await prisma.$disconnect();
  }
};


exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });

    res.json(category);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Server Error",
    });
  }
};
