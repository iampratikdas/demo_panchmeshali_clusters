const fs = require("fs");
const path = require("path");
const moment = require("moment");

const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
require('dotenv').config();
// Utility imports
const gen = require("../utils/GenKey.js");
const Config = require("../utils/Config.js");
const { encrypt, verify } = require("../utils/hashing");
const {
  GenUserToken,
  GetUserAuthorization,
} = require("../utils/Authorization.js");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class UserController {
  constructor(module) {
    console.log("User controller is active now====>");
    this.userFunc = module.usersFunctions;
    this.contentFunc = module.contentFunctions;
    this.voteFunc = module.voteFunctions;
    this.eventFunc = module.eventFunctions;
  }

  async signupbygoogle(req, res) {
    try {
      const user = req.user;
      let existingUser = await this.userFunc.findOneUserByEmail(user._json.email);
      // console.log("Google User:", user);
      let hashedPassword = ""
      if (!existingUser) {
        const pass = "12345678910"
        hashedPassword = await encrypt(pass);
        existingUser = {
          full_name: user.name.givenName + (user.name.familyName ? user.name.familyName : ""),
          email: user._json.email,
          password: hashedPassword,
          // ip,
          uid: gen(10),
          role: "user",
          skills: "",
          phone_number: "",
          badge: [],
          type: [],
          ph_country_code: "",
          created_at: moment().unix(),
          updated_at: moment().unix(),
        }

        await this.userFunc.UserInsert(existingUser)
      }
      const token = await GenUserToken(existingUser, moment().unix());
      const { password, _id, created_at, is_deleted, updated_at, ...users } = existingUser;
      console.log("user===================>", req.query.state)
      res
        .cookie("token", token, {
          httpOnly: false,
          secure: true,
          sameSite: "Strict",
          domain: ".panchmeshali.com",
          maxAge: 1000 * 60 * 60 * 24
        })
        .cookie("user", JSON.stringify(users), {
          httpOnly: false,
          secure: true,
          domain: ".panchmeshali.com",
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24
        })
        .status(200)
        .send(`
          <html>
            <script>
            setTimeout(() => {
              window.location.href = "https://www.panchmeshali.com/";
            }, 1000);
          </script>
          </html>
        `);

    } catch (err) {
      // console.log("errorr=====>", err)
      res.status(500).json({ "message": "internal server error" })
    }

  }

  async helperFunctionSignin() {

  }


  async login(req, res) {
    // this.call_model_func()
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email and password are required.",
        data: {},
      });
    }

    try {
      const existingUser = await this.userFunc.findOneUserByEmail(email);
      if (!existingUser) {
        return res.status(404).json({
          status: 404,
          message: "User does not exist!",
          data: {},
        });
      }
      const isPasswordValid = await verify(password, existingUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 401,
          message: "Invalid password!",
          data: {},
        });
      }

      const token = await GenUserToken(existingUser, moment().unix());
      const { password: _password, token: _token, ...userData } = existingUser;
      if (!existingUser.isActive) {

        await this.userFunc.UserUpdate({
          isActive: true,
          updated_at: moment().unix(),
        }, existingUser.uid);
      }
      return res.status(200).json({
        status: 200,
        message: "Login successful!",
        data: {
          tokenAdvanced: token,
          user: userData,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        status: 500,
        message: "Something went wrong.",
        data: {},
      });
    }
  }

  async signup(req, res) {

    const {
      full_name,
      email,
      password,
      ip,
      role,
      skills,
      phone_number,
      ph_country_code,
      type
    } = req.body;
    // console.log("usercheck----------------------------------->", req.body)
    try {
      const regx = /\d+/;
      const existingUser = await this.userFunc.findOneUserByEmail(email);
      if ((regx).test(full_name)) {
        return res.status(400).json({
          status: 400,
          message: "Full name should not contain numbers.",
          data: {},
        });
      }

      if (existingUser && !existingUser.is_deleted) {
        return res
          .status(400)
          .json({ status: 400, message: "Email already exists!", data: {} });
      }

      const hashedPassword = await encrypt(password);
      const token_data = await GenUserToken({
        full_name: full_name,
        email: email,
        ph_country_code: ph_country_code,
        phone_number: phone_number,
        ip: ip,
        role: role,
      }, moment().unix())
      const newUser = await this.userFunc.UserInsert({
        // uid: gen(10),
        full_name: full_name,
        email: email,
        skills,
        password: hashedPassword,
        ph_country_code,
        phone_number: phone_number,
        ip: [ip],
        role,
        badge: [],
        type: type || "writer",
        token: token_data,
        created_at: moment().unix(),
        updated_at: moment().unix(),
      });
      return res.status(201).json({
        status: 201,
        message: "User created successfully!",
        data: {
          user: {
            id: newUser._id,
            full_name: newUser.full_name,
            email: newUser.email,
            phone_number: newUser.phone_number,
            ph_country_code: newUser.ph_country_code,
            role: newUser.role,
            token: token_data,
          },
        }
      },)


    } catch (error) {
      console.error("Error during signup:", error);
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: {} });
    }
  }




  async createuser(req, res) {

    async function sendEmail(to, name, state) {
      let mailOptions = {}

      if (state) {
        mailOptions = {
          from: process.env.EMAIL_USER,
          to,
          subject: 'পরবর্তী রাউন্ডে অভিনন্দন Notice: 12 ',
          html: `
        <!DOCTYPE html>
        <html lang="bn">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>পরবর্তী রাউন্ডে অভিনন্দন Notice: 12 </title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Noto Sans Bengali', sans-serif;
                background: #f2efe4;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
              }
              .email-container {
                max-width: 640px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                overflow: hidden;
                border: 2px solid #e6d4ab;
              }
              .header {
                background: linear-gradient(135deg,#fdf6e3,#f6e2b5,#f9f4dd);
                text-align: center;
                padding: 30px 20px 20px;
                border-bottom: 5px solid #c99a4e;
              }
              .header img {
                max-width: 130px;
                height: auto;
              }
              .content {
                padding: 30px 25px;
                color: #333333;
                font-size: 18px;
                line-height: 1.7;
                text-align: left;
                background: #fffdf7;
              }
              .content a {
                display: inline-block;
                margin-top: 10px;
                padding: 8px 16px;
                background: #c99a4e;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                transition: background .3s;
              }
              .content a:hover {
                background: #b1833e;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #666666;
                padding: 15px;
                background: #fdf6e3;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <img src="https://www.panchmeshali.com/logo.png" alt="পাঁচমেশালী লোগো">
                <br> </br>
                <h1 style="margin:0px"> পাঁচমেশালী  </h1>
              </div>
             <div class="content">
                প্রিয় প্রতিযোগী,<br><br>
                আমরা প্রতিযোগিতার চূড়ান্ত রাউন্ডের ফলাফল প্রকাশের জন্য ১২ই অক্টোবর তারিখ নির্ধারণ করেছি।<br><br>
                <a href="https://admin.panchmeshali.com" target="_blank">admin.panchmeshali.com</a><br><br>
                ১২ই অক্টোবর , আমরা লাইভের মাধ্যমে ফল প্রকাশ করবো।
 

                আমরা আপনার সৃজনশীল অবদানের অপেক্ষায় আছি।<br><br>

                শুভেচ্ছান্তে,<br>
                <strong>পাঁচমেশালী টিম</strong>
              </div>


              <div class="footer">
                © ${new Date().getFullYear()} পাঁচমেশালী&nbsp;|&nbsp;এই ইমেলটি একটি স্বয়ংক্রিয় বার্তা
              </div>
            </div>
          </body>
        </html>
        `
        };
      } else {
        mailOptions = {
          from: process.env.EMAIL_USER,
          to,
          subject: 'অংশগ্রহণের জন্য ধন্যবাদ- অণুতে অনন্ত: প্রতিযোগিতার (Notice 12)',
          html: `
        <!DOCTYPE html>
        <html lang="bn">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>শংসাপত্র</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Noto Sans Bengali', sans-serif;
                background: #f2efe4;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
              }
              .email-container {
                max-width: 640px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                overflow: hidden;
                border: 2px solid #e6d4ab;
              }
              .header {
                background: linear-gradient(135deg,#fdf6e3,#f6e2b5,#f9f4dd);
                text-align: center;
                padding: 30px 20px 20px;
                border-bottom: 5px solid #c99a4e;
              }
              .header img {
                max-width: 130px;
                height: auto;
              }
              .content {
                padding: 30px 25px;
                color: #333333;
                font-size: 18px;
                line-height: 1.7;
                text-align: left;
                background: #fffdf7;
              }
              .content a {
                display: inline-block;
                margin-top: 10px;
                padding: 8px 16px;
                background: #c99a4e;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                transition: background .3s;
              }
              .content a:hover {
                background: #b1833e;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #666666;
                padding: 15px;
                background: #fdf6e3;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
               <img src="https://www.panchmeshali.com/logo.png" alt="পাঁচমেশালী লোগো">
                <br> </br>
                <h1 style="margin:0px"> পাঁচমেশালী  </h1>
              </div>
              <div class="content">
                প্রিয় প্রতিযোগী,<br><br>
                আমরা প্রতিযোগিতার চূড়ান্ত রাউন্ডের ফলাফল প্রকাশের জন্য ১২ই অক্টোবর তারিখ নির্ধারণ করেছি।<br><br>
                <a href="https://admin.panchmeshali.com" target="_blank">admin.panchmeshali.com</a><br><br>
                ধন্যবাদান্তে,<br>
                <strong>পাঁচমেশালী টিম</strong>
              </div>
              <div class="footer">
                © ${new Date().getFullYear()} পাঁচমেশালী&nbsp;|&nbsp;এই ইমেলটি একটি স্বয়ংক্রিয় বার্তা
              </div>
            </div>
          </body>
        </html>
        `
        };
      }




      // console.log()
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${name} (${to})`, state);
      } catch (error) {
        console.error(`Failed to send email to ${to}: ${error.message}`);
      }
    }
    let eventCheck = await this.eventFunc.findOneEvent({ eid: req.query.eid });
    if (!eventCheck) {
      res
        .status(400)
        .json({ status: 400, message: "Please provide correct id for the event", data: {} });
    }
    const contents_list = await this.voteFunc.findContentListAggregates([
      {
        $match: { status: req.query.status, eid: req.query.eid },
      },
      {
        $lookup: {
          from: "votes",
          localField: "cont_id",   // cont_id from contents
          foreignField: "cont_id", // cont_id from votes
          as: "votes"
        }
      },
      {
        $addFields: {
          voteCount: { $size: "$votes" },              // total votes
          uids: { $map: { input: "$votes", as: "v", in: "$$v.uid" } } // extract all voter uids
        }
      },
      {
        $project: {
          _id: 0,
          // cont_id: 1,
          // eid: 1,
          // name: 1,
          author_name: 1,
          // content: 1,
          voteCount: 1,
          uid: 1,
          // email: 1
        }
      }, {
        $sort: { voteCount: -1 }
      }
    ]);

    const existingUser = await Promise.all(
      contents_list.map(async (profiles) => {
        // get the user list for this uid
        const users = await this.userFunc.userListByData({ uid: profiles.uid });
        // return the first one (or null if empty)
        return users[0] || null;
      })
    );

    try {
      let count = 0;
      let arr = existingUser.map(items => items.email)
      await sendEmail(arr, "", true);
      // for(let members of existingUser){
      //   const name = members.full_name;
      //   const email = members.email;
      //   console.log("eventCheck============>", eventCheck)
      //   if(count+1 <= eventCheck.sh_list ){
      //     await sendEmail(email, name , true);
      //   }else{
      //     // await sendEmail(email, name ,false);
      //   }
      //   count++
      // }
      console.log("existingUser=========>", existingUser.length, arr)
      res.status(200).json({
        message: "Mail sentssss",
        // contents: existingUser
      });

    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing the Excel file.');
    }
  }

  async updateprofile(req, res, token_data) {
    const {
      full_name,
      skills,
      phone_number,
      ph_country_code,
    } = req.body;

    try {
      const regx = /\d+/;
      // const existingUser =  await this.userFunc.findOneUserByEmail(email);
      if (!token_data.isActive) {

        if ((regx).test(full_name)) {
          return res.status(400).json({
            status: 400,
            message: "Full name should not contain numbers.",
            data: {},
          });
        }
      }



      //  const hashedPassword = await encrypt(password);

      const newUser = await this.userFunc.UserUpdate({
        // uid: gen(10),
        full_name: full_name,
        // email: email,
        // password: hashedPassword,
        ph_country_code,
        phone_number: phone_number,
        // ip: [ip],
        skills,
        isfirstTimeLogin: false,
        // token: token_data,
        // created_at: moment().unix(),
        updated_at: moment().unix(),
      }, token_data.uid);
      const existingUser = await this.userFunc.findOneUserByEmail(token_data.email);
      return res.status(201).json({
        status: 201,
        message: "User created successfully!",
        data: {
          user: {
            // id: newUser._id,
            full_name: existingUser.full_name,
            email: existingUser.email,
            phone_number: existingUser.phone_number,
            ph_country_code: existingUser.ph_country_code,
            role: existingUser.role,
            // token: token_data,
          },
        }
      },)


    } catch (error) {
      console.error("Error during signup:", error);
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: {} });
    }
  }

  async updateprofileAdmin(req, res, token_data) {
    const {
      full_name,
      skills,
      phone_number,
      ph_country_code,
      password,
      isfirstTimeLogin,
      address,
      role,
      isActive,
      profileImage,
      dob,
      email,
      is_deleted,
    } = req.body;

    try {
      const regx = /\d+/;
      if (!req.query.uid) {
        res
          .status(400)
          .json({ status: 400, message: "Please send the uid of the user", data: {} });
      }
      const existingUser = await this.userFunc.findOneUserByUid(req.query.uid);
      if (!existingUser) {
        res
          .status(400)
          .json({ status: 400, message: "User Not Found", data: {} });
      }

      let paginationObj = await this.userFunc.userPagination(req);

      const { skip, limit, page } = paginationObj;
      const totalUsers = await this.userFunc.userCount(req.body.filter);
      const totalPages = Math.ceil(totalUsers / limit);
      const data_update = {
        ...(full_name && { full_name: full_name }),
        ...(email && { email: email }),
        ...(dob && { dob: dob }),
        ...(address && { address: address }),
        ...(role && { role: role }),
        ...(isActive && { isActive: isActive }),
        ...(ph_country_code && { ph_country_code: ph_country_code }),
        ...(phone_number && { phone_number: phone_number }),
        ...(skills && { skills: skills }),
        ...(isfirstTimeLogin && { isfirstTimeLogin: isfirstTimeLogin }),
        ...(password && { password: await encrypt(password) }),
        updated_at: moment().unix(),
      }
      console.log("data_update======>", data_update, full_name)
      const newUser = await this.userFunc.UserUpdate(data_update, req.query.uid);

      const users = await this.userFunc.userListByData({}, skip, req.query.limit);
      return res.status(201).json({
        status: 201,
        message: "User updated successfully!",
        data: users,
        pagination: {
          totalUsers,
          totalPages,
          currentPage: page,
          pageSize: limit,
          next: users.length === 0 ? false : page === totalPages ? false : true
        }
      },)


    } catch (error) {
      console.error("Error during signup:", error);
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: {} });
    }
  }

  async userslist(req, res) {
    try {
      let paginationObj = await this.userFunc.userPagination(req);
      const { skip, limit, page } = paginationObj;
      const totalUsers = await this.userFunc.userCount(req.body.filter);
      const totalPages = Math.ceil(totalUsers / limit);
      const users = await this.userFunc.userListByData(req.body.filter, skip, limit);
      return res
        .status(201)
        .json({
          status: 201, message: "User list fetched",
          data: users,
          pagination: {
            totalUsers,
            totalPages,
            currentPage: page,
            pageSize: limit,
            next: users.length === 0 ? false : page === totalPages ? false : true
          }
        });
    } catch (error) {
      console.error("Error during signup:", error);
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: {} });
    }
  }



  async getprofile(req, res, token_data) {
    try {
      const users = await this.userFunc.gerProfile(token_data.uid);
      console.log('User List:', users);
      return res
        .status(201)
        .json({ status: 201, message: "User Profile fetched", data: users });
    } catch (error) {
      console.error("Error during signup:", error);
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: {} });
    }
  }

  async searchList(req, res, token_data, paginationFunc) {
    try {
      let paginationObj = await paginationFunc(req);
      const { skip, limit, page } = paginationObj;
      let listCounts = 0;
      let data = [];
      let filter = req.body.filter;

      switch (req.query.search) {
        case "admin_search_users":
          listCounts = await this.userFunc.userCount(req.body.filter);
          data = await this.userFunc.userListByData(req.body.filter, skip, limit);
          break;
        case "admin_search_contentlist":
          listCounts = await this.contentFunc.contentCount(req.body.filter);
          data = await this.contentFunc.contentListByData(req.body.filter, skip, limit);
          break;
        default:
          return res.status(400).json({ status: 400, message: "Invalid search", data: {} });
      }
      const totalPages = Math.ceil(listCounts / limit);
      return res
        .status(201)
        .json({
          status: 201, message: `${req.query.search} list fetched`,
          data: data,
          pagination: {
            listCounts,
            totalPages,
            currentPage: page,
            pageSize: limit,
            next: users.length === 0 ? false : page === totalPages ? false : true
          }
        });
    } catch (error) {
      console.error("Error during signup:", error);
      res
        .status(500)
        .json({ status: 500, message: "Internal server error", data: {} });
    }
  }
}

module.exports = UserController;
