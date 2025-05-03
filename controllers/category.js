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

exports.testdb = async (req, res) => {
  try {
    const category = await prisma.category.findMany();
    res.json(category);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
};

exports.list = async (req, res) => {
  try {
    const category = await prisma.category.findMany();
    res.json(category);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Server Error",
    });
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
