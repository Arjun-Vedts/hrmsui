import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import Datatable from "../../datatable/Datatable";
import Swal from "sweetalert2";
import { getDesignation } from "../../service/master.service";

const Designation = () => {

    const [designationList, setDesignationList] = useState([]);


    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {
        try {
            const response = await getDesignation();
            setDesignationList(response?.data || []);
        } catch (error) {
            console.error("Error fetching designations:", error);
            Swal.fire("Error", "Failed to fetch designation data. Please try again later.", "error");
        }
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Designation Code", selector: (row) => row.designationCode, sortable: true, align: 'text-center' },
        { name: "Designation Name", selector: (row) => row.designationName, sortable: true, align: 'text-center' },
        { name: "Cadre", selector: (row) => row.designationCadre, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {

        return designationList.map((desig, index) => ({
            sn: index + 1,
            designationCode: desig.desigCode,
            designationName: desig.designation,
            designationCadre: desig.desigCadre,
        }));
    }

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Designation List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

        </div>
    )
};

export default Designation;