/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HODSubjectManagement() {

    const [subjects, setSubjects] = useState([]);


    // ==========================================
    // GET LOGIN DATA
    // ==========================================

    const token =
        localStorage.getItem("jwtToken");

    const hodId =
        localStorage.getItem("id");


    // ==========================================
    // GET DEPARTMENT SUBJECTS
    // ==========================================

    async function getSubjects() {

        try {

            const response = await fetch(

                `http://localhost:8080/api/v1/hod/subject/all/${hodId}`,

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


            const responseText =
                await response.text();


            let responseObject = {};


            if (responseText) {

                responseObject =
                    JSON.parse(responseText);

            }


            if (response.ok) {

                setSubjects(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    `Unable to fetch subjects (${response.status})`
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
    // LOAD SUBJECTS
    // ==========================================

    useEffect(() => {

        getSubjects();

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
                    Department Subjects
                </h2>

                <p className="text-muted">
                    Subjects belonging to your department
                </p>

            </div>


            {/* ================================== */}
            {/* SUBJECT TABLE */}
            {/* ================================== */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-3">
                        Subjects
                    </h4>


                    <div className="table-responsive">

                        <table className="table table-bordered table-hover">


                            <thead className="table-primary">

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Subject
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Credits
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


                                {subjects.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center"
                                        >

                                            No subjects found

                                        </td>

                                    </tr>

                                ) : (

                                    subjects.map(

                                        (subject) => (

                                            <tr
                                                key={
                                                    subject.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        subject.id
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        subject.name ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        subject.code ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        subject.credits ??
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        subject.course?.name ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    {
                                                        subject.semester
                                                            ? `Semester ${subject.semester.semesterNumber}`
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