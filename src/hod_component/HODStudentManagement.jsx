/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HODStudentManagement() {

    const [students, setStudents] = useState([]);


    // ==========================================
    // GET LOGIN DATA
    // ==========================================

    const token =
        localStorage.getItem("jwtToken");

    const hodId =
        localStorage.getItem("id");


    // ==========================================
    // GET STUDENTS
    // ==========================================

    async function getStudents() {

        try {

            const response = await fetch(

                `http://localhost:8080/api/v1/hod/student/all/${hodId}`,

                {
                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }
                }

            );


            const responseObject =
                await response.json();


            if (response.ok) {

                setStudents(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    "Unable to fetch students"
                );

            }

        } catch (error) {

            console.error(error);

            toast.error(
                "Server error"
            );

        }

    }


    // ==========================================
    // LOAD STUDENTS
    // ==========================================

    useEffect(() => {

        getStudents();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="container mt-4 mb-5">


            {/* ================================== */}
            {/* HEADER */}
            {/* ================================== */}

            <div className="mb-4">

                <h2>
                    Department Students
                </h2>

                <p className="text-muted">
                    Students belonging to your department
                </p>

            </div>


            {/* ================================== */}
            {/* STUDENT TABLE */}
            {/* ================================== */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-3">
                        Students
                    </h4>


                    <div className="table-responsive">

                        <table className="table table-bordered table-hover">


                            <thead className="table-primary">

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Roll No
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Course
                                    </th>

                                    <th>
                                        Semester
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {students.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="text-center"
                                        >

                                            No students found

                                        </td>

                                    </tr>

                                ) : (

                                    students.map(

                                        (student) => (

                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        student.id
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.name ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.rollNo ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.email ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.phone ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.department?.name ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        student.course?.name ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    {
                                                        student.semester
                                                            ? `Semester ${student.semester.semesterNumber}`
                                                            : "-"
                                                    }

                                                </td>

                                            </tr>

                                        )

                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}