/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function FacultySubjects() {
    const [subjects, setSubjects] = useState([]);

    const token = localStorage.getItem("jwtToken");
    const facultyId = localStorage.getItem("id");

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    useEffect(() => {
        getFacultySubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function getFacultySubjects() {
        try {
            const response = await fetch(
                `http://localhost:8080/api/v1/faculty/subjects/${facultyId}`,
                {
                    method: "GET",
                    headers: headers
                }
            );

            const responseObject = await response.json();

            if (response.ok) {
                setSubjects(responseObject.data || []);
            } else {
                toast.error(
                    responseObject.message ||
                    "Unable to load subjects"
                );
            }
        } catch (error) {
            console.error(error);
            toast.error(
                "Unable to connect to server"
            );
        }
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="mb-4">
                <h2>My Subjects</h2>
                <p className="text-muted">
                    Subjects assigned to you for teaching
                </p>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    {subjects.length === 0 ? (
                        <p className="text-muted mb-0">
                            No subjects assigned.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Subject</th>
                                        <th>Code</th>
                                        <th>Semester</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {subjects.map((subject) => (
                                        <tr key={subject.id}>
                                            <td>
                                                {subject.name}
                                            </td>

                                            <td>
                                                {subject.code}
                                            </td>

                                            <td>
                                                {subject.semester?.name ||
                                                    subject.semester?.semesterNumber ||
                                                    "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}