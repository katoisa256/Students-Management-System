import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase-config';
import { useSelector, useDispatch } from 'react-redux';
import { setAlertBox, setStudents } from '../store';
import AlertComponent from "./AlertComponent";

const PresentStudent = () => {
    const { students } = useSelector((state) => state.students);
    const [rollNumbers, setRollNumbers] = useState([]);
    const dispatch = useDispatch();

    // Define the total number of school days in 3 months (e.g., 90 days)
    const totalSchoolDays = 90;

    // Fetch students from Firebase
    const getStudent = async () => {
        const studentRef = collection(db, 'students');
        try {
            const response = await getDocs(studentRef);
            const studentData = response.docs.map((doc) => ({
                data: doc.data(),
                id: doc.id,
            }));

            // Sort students by check-in time (oldest to newest)
            const sortedStudents = studentData.sort((a, b) => {
                const dateA = new Date(a.data.checkin);
                const dateB = new Date(b.data.checkin);
                return dateA - dateB; // Ascending order (old first, new last)
            });

            dispatch(setStudents(sortedStudents));
        } catch (error) {
            console.log("Error fetching students:", error);
        }
    };

    // Fetch students on component mount
    useEffect(() => {
        getStudent();
    }, []);

    // Handle student checkout
    const handleCheckout = async (id, name) => {
        const docRef = doc(db, 'students', id);
        try {
            await updateDoc(docRef, {
                checkout: new Date().toLocaleTimeString(),
            });
            dispatch(setAlertBox({ 
                title: "Successfully Checked-Out", 
                message: `${name} checked-out`, 
                color: "teal", 
                show: true 
            }));
        } catch (error) {
            dispatch(setAlertBox({ 
                title: "Error!", 
                message: error.message, 
                color: "red", 
                show: true 
            }));
            console.log("Error during checkout:", error);
        }
        getStudent();
    };

    // Get the frequency of each roll number (attendance count)
    function getAttendanceCount(arr) {
        const frequencyMap = {};

        arr.forEach((rollNumber) => {
            frequencyMap[rollNumber] = (frequencyMap[rollNumber] || 0) + 1;
        });

        return frequencyMap;
    }

    // Update roll numbers when students change
    useEffect(() => {
        const allRollNumbers = students.map((student) => student.data.rollNumber);
        const attendanceCounts = getAttendanceCount(allRollNumbers);
        setRollNumbers(attendanceCounts);
    }, [students]);

    // Calculate attendance percentage
    const calculatePercentage = (attendanceCount) => {
        return ((attendanceCount / totalSchoolDays) * 100).toFixed(2); // 2 decimal places
    };

    return (
        <>
            <AlertComponent />
            <div className="w-full pt-20 mb-10">
                <h1 className="text-2xl font-bold mb-6 text-purple-400 text-center">
                    Present Students In School
                </h1>

                <table className="w-full border">
                    <thead>
                        <tr className="bg-purple-100">
                            <th className="border px-4 py-2">Sr. No.</th>
                            <th className="border px-4 py-2">Reg Number</th>
                            <th className="border px-4 py-2">Name</th>
                            <th className="border px-4 py-2">Check-in Time</th>
                            <th className="border px-4 py-2">Check-out Time</th>
                            <th className="border px-4 py-2">Days Attended</th>
                            <th className="border px-4 py-2">Attendance Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.id}>
                                <td className="border px-4 py-2">{index + 1}</td>
                                <td className="border px-4 py-2">{student.data.rollNumber}</td>
                                <td className="border px-4 py-2">{student.data.name}</td>
                                <td className="border px-4 py-2">
                                    <button className="m-1 bg-transparent hover:bg-green-400 text-green-600 font-semibold hover:text-white py-2 px-4 border border-green-400 hover:border-transparent rounded">
                                        {student.data.checkin}
                                    </button>
                                </td>
                                <td className="border px-4 py-2">
                                    {student.data.checkout ? (
                                        <button className="m-1 bg-red-400 font-semibold text-white py-2 px-6 border border-red-400 hover:border-transparent rounded">
                                            {student.data.checkout}
                                        </button>
                                    ) : (
                                        <button
                                            className="m-1 bg-transparent hover:bg-red-400 text-red-600 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded"
                                            onClick={() => handleCheckout(student.id, student.data.name)}
                                        >
                                            Leave School
                                        </button>
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {rollNumbers[student.data.rollNumber]}
                                </td>
                                <td className="border px-4 py-2">
                                    {calculatePercentage(rollNumbers[student.data.rollNumber] || 0)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default PresentStudent;
