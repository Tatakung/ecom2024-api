const prisma = require("../config/prisma");
exports.listUser = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        adddress: true,
      },
    });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        enabled: enabled,
      },
    });
    res.json("บันทึกสำเร็จ");
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        role: role,
      },
    });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    // หาว่า คนที่กำลัง login มันมี ตะกหร้าไหม แล้ว มันมี cart_id อะไร ถ้ามี จะแสดงผล ถ้าไม่มี ก็ไม่รู้ว่า จะทำอย่างไรละ ?
    // หาว่ามี cart เดิมไหม
    const oldCart = await prisma.cart.findFirst({
      where: {
        userId: Number(req.user.id),
      },
    });

    if (oldCart) {
      // ลบ productOnCart ก่อน
      await prisma.productOnCart.deleteMany({
        where: {
          cartId: oldCart.id,
        },
      });

      // แล้วค่อยลบ cart
      await prisma.cart.deleteMany({
        where: {
          userId: Number(req.user.id),
        },
      });
    }

    const create_cart = await prisma.cart.create({
      data: {
        userId: Number(req.user.id),
        cartTotal: cartTotal,
        productoncarts: {
          create: products,
        },
      },
    });

    res.json({
      message: "เพิ่มเข้าตะก้าสำเร็จ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error555",
    });
  }
};
exports.getuserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: Number(req.user.id),
      },
      include: {
        productoncarts: {
          include: {
            productOnCart_m_to_o_product: true,
          },
        },
      },
    });
    res.json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.emptyCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: Number(req.user.id),
      },
    });
    if (!cart) {
      return res.status(400).json({
        message: "ไม่มี ตะกร้า",
      });
    }

    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    await prisma.cart.deleteMany({
      where: {
        userId: Number(req.user.id),
      },
    });

    res.json({
      message: "ลบตะกร้าสำเร็จ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.saveAddress = async (req, res) => {
  try {
    const { adddress } = req.body;

    const addressuser = await prisma.user.update({
      where: {
        id: Number(req.user.id),
      },
      data: {
        adddress: adddress,
      },
    });

    res.json({
      message: "เพิ่มที่อยู่สำเร็จ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.saveOrder = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId: Number(req.user.id),
      },
      include: {
        productoncarts: true,
      },
    });



    // console.log(cart);

    if (!cart || cart.productoncarts.length === 0) {
      return res.status(400).json({
        message: "ไม่มีตะกร้า",
        ok: false,
      });
    }

    const new_cart = cart.productoncarts.map((item) => ({
      // cartId: cart.id,
      productId: item.productId,
      // orderId: Number(req.user.id),
      count: item.count,
      price: item.price,
    }));

    // เช็คจำนวนว่ามันพอไหม ถ้าไม่พอ ให้มันหยุดทำงาน และส่ง res กลับไปแจ้งเขา
    for (const item of new_cart) {
      const pd = await prisma.product.findUnique({
        where: {
          id: item.productId,
        },
        select: {
          quantity: true,
          title: true,
        },
      });
      if (!pd || item.count > pd.quantity) {
        return res.status(400).json({
          ok: false,
          message: "สินค้า" + pd.title + "หมด",
        });
      }
    }

    // เพิ่มลงใน orderและ orderdetail
    const cre_order = await prisma.order.create({
      data: {
        cardTotal: cart.cartTotal,
        orderStatus: "Paid", //ชำระเงินแล้ว
        userId: Number(req.user.id),
        products: {
          create: new_cart,
        },
      },
    });

    //  แน่นอนว่า หลังขจจกาที่ ขายได้แล้วอะ   เราจะต้องเข้าไปลบ product ว่า มันเหลือกี่ชิ้น หลังจากขายไป และ จะต้องเข้าไปเพิ่ม sold ด้วย ว่าขขสยไกเ้กี่ขชิ้นอะ
    for (const items of new_cart) {
      console.log(items);
      const ix_pd = await prisma.product.update({
        where: {
          id: items.productId,
        },
        data: {
          quantity: {
            decrement: items.count,
          },
          sold: {
            increment: items.count,
          },
        },
      });
    }

    // ลบพวกในตะกร้าด้วย
    // ลบ productOnCart ก่อน
    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    // แล้วค่อยลบ cart
    await prisma.cart.deleteMany({
      where: {
        userId: Number(req.user.id),
      },
    });

    res.json({
      ok: true,
      message: "เพิ่มลงorderสำเร็จ",
    });

    
  } catch (error) {
    console.log('มันเข้า loop error ด้วยซ้ำอะ ')
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.getOrder = async (req, res) => {

  try {
    console.log('มาแล้ว')
    const orders = await prisma.order.findMany({
      where: {
        userId: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: {
              include : {
                category : true
              }
            }
          },
        },
        user: true,
      },
      
    });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
