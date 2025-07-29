import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Chip,
} from "@material-tailwind/react";
import { getVaccinationRecords } from "@/data/getVaccinationRecords";

const TABLE_HEAD = ["Patient", "Vaccine", "Due Date", "Administered", "Status"];

export function VaccinationTable() {
    return (
        <Card className="mt-8">
            <CardHeader variant="gradient" color="teal" className="mb-8 p-6">
                <Typography variant="h6" color="white">
                    Vaccination Records
                </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                <table className="w-full min-w-[640px] table-auto">
                    <thead>
                        <tr>
                            {TABLE_HEAD.map((el) => (
                                <th
                                    key={el}
                                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                >
                                    <Typography
                                        variant="small"
                                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                                    >
                                        {el}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {getVaccinationRecords.map(
                            ({ name, vaccine, dueDate, dateAdministered, status }, idx) => (
                                <tr key={idx}>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-sm font-medium text-blue-gray-600">
                                            {name}
                                        </Typography>
                                    </td>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-sm font-normal text-blue-gray-600">
                                            {vaccine}
                                        </Typography>
                                    </td>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-sm text-blue-gray-600">
                                            {dueDate}
                                        </Typography>
                                    </td>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Typography className="text-sm text-blue-gray-600">
                                            {dateAdministered || "N/A"}
                                        </Typography>
                                    </td>
                                    <td className="py-3 px-5 border-b border-blue-gray-50">
                                        <Chip
                                            variant="ghost"
                                            color={status === "done" ? "green" : "amber"}
                                            value={status.toUpperCase()}
                                            className="text-[11px] font-semibold w-fit"
                                        />
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </CardBody>
        </Card>
    );
}
