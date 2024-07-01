const mongoose = require("mongoose");
const {Schema} = mongoose;

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        default: 18,
        max: [80, "Too old..."],
        min: [0, "年齡不可小於0"],
    },
    major: {
        type: String,
    },
    schlarship: {
        merit: {
            type: Number,
            min: 0,
            max: [6000, "merit太多了"],
            default: 0,
        },
        other: {
            type: Number,
            min: 0,
            default: 0,
        }
    },
})

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;