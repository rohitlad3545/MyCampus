/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HODFacultyManagement() {

    const [faculty, setFaculty] = useState([]);


    // ==========================================
    // GET LOGIN DATA
    // ==========================================

    const token =
        localStorage.getItem("jwtToken");

    const hodId =
        localStorage.getItem("id");


    // ==========================================
    // GET DEPARTMENT FACULTY
    // ==========================================

    async function getFaculty() {

        try {

            const response = await fetch(

                `http://localhost:8080/api/v1/hod/faculty/all/${hodId}`,

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

                setFaculty(
                    responseObject.data || []
                );

            } else {

                toast.error(
                    responseObject.message ||
                    `Unable to fetch faculty (${response.status})`
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
    // LOAD FACULTY
    // ==========================================

    useEffect(() => {

        getFaculty();

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
                    Department Faculty
                </h2>

                <p className="text-muted">
                    Faculty members belonging to your department
                </p>

            </div>


            {/* ================================== */}
            {/* FACULTY TABLE */}
            {/* ================================== */}

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-3">
                        Faculty
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
                                        Employee ID
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Designation
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                </tr>

                            </thead>


                            <tbody>


                                {faculty.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="text-center"
                                        >

                                            No faculty found

                                        </td>

                                    </tr>

                                ) : (

                                    faculty.map(

                                        (member) => (

                                            <tr
                                                key={
                                                    member.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        member.id
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        member.name ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        member.employeeId ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        member.email ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        member.phone ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        member.designation ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        member.department?.name ||
                                                        "-"
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