const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Student = require("./modules/student");
const methodOverride = require("method-override");
//const cors = require("cors");

const port = 3000;

mongoose
  .connect("mongodb://localhost:27017/exampleDB")
  .then(() => {
    console.log("MongoDB connection complete.");
  })
  .catch((e) => {
    console.log(e);
  });

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

//全部學生資料的頁面
app.get("/students", async (req, res) => {
  try {
    let studentData = await Student.find({}).exec();
    //return res.send(studentData);
    return res.render("students", { studentData });
  } catch (e) {
    return res.status(500).send(e);
  }
});

//新增學生的頁面route
app.get("/students/new", (req, res) => {
  return res.render("new-student-form");
});

//針對個別學生頁面請求的route
app.get("/students/:id", async (req, res) => {
  try {
    let { id } = req.params;
    //console.log({id});
    let foundStudent = await Student.findOne({ _id: id }).exec();
    //在URL中的id亂打可以發現foundStudent找到的值會是Null, 所以就可以這樣寫判斷:
    if (foundStudent != null) {
      return res.render("student-page", { foundStudent });
    } else {
      return res.status(400).render("student-not-found");
    }
  } catch (e) {
    return res.status(400).render("student-not-found");
  }
});

//修改資料頁面的route
app.get("/students/:id/edit", async (req, res) => {
  try {
    let { id } = req.params;
    let foundStudent = await Student.findOne({ _id: id }).exec();
    //console.log(foundStudent);
    if (foundStudent != null) {
      return res.render("edit-student", { foundStudent });
    } else {
      return res.status(400).render("student-not-found");
    }
  } catch (e) {
    return res.status(400).render("student-not-found");
  }
});

//使用者用post新增資料
app.post("/students", async (req, res) => {
  let { name, age, major, merit, other } = req.body;

  try {
    let newStudent = new Student({
      name,
      age,
      major,
      schlarship: {
        merit,
        other,
      },
    });
    let saveStudent = await newStudent.save();

    //資料新增並儲存成功後丟到save complete的頁面呈現資料給user看
    return res.render("student-save-success", { saveStudent });
  } catch (e) {
    //如果資料亂填(不符合Schema要求), 就要丟錯誤頁面給使用者
    return res.status(400).render("student-save-fail");
  }
});

//用put更改資料
app.put("/students/:id", async (req, res) => {
  try {
    //let {id} = req.params;  懶得用變數裝req.params, 所以直接在底下_id:裡面寫了,呵呵
    let { name, age, major, merit, other } = req.body;
    let newData = await Student.findOneAndUpdate(
      { _id: req.params.id },
      { name, age, major, schlarship: { merit, other } },
      {
        new: true,
        runValidators: true,
        overwrite: true,
      }
    );

    return res.render("student-update-success", { newData });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.patch("/students/:id", async (req, res) => {
  try {
    let { name, age, major, merit, other } = req.body;
    //也可以用findByIdAndUpdate
    let newData = await Student.findOneAndUpdate(
      { _id: req.params.id },
      {
        name,
        age,
        major,
        "schlarship.merit": merit,
        "schlarship.other": other,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.send({ msg: "成功更新資料", updatedData: newData });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//刪除學生資料頁面
app.delete("/students/:id", async (req, res) => {
  try {
    let deleteResult = await Student.deleteOne({ _id: req.params.id });
    //以後盡量都在response前補個return
    return res.render("delete-success", { deleteResult });
  } catch (e) {
    console.log(e);
    return res.status(500).send("無法刪除資料....");
  }
});

app.listen(port, () => {
  console.log("Server is now listen on port 3000");
});
