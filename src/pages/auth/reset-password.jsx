import {
    Card,
    Input,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

// Validation Schema
const schema = Yup.object({
    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
});

export function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState("");
    const [serverSuccess, setServerSuccess] = useState("");

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setServerError("");
        try {
            const res = await axiosInstance.post(
                `/auth/reset-password?token=${encodeURIComponent(token)}`,
                {
                    newPassword: data.password,
                }
            );
            if (res.status === 200) {
                setServerSuccess("Password reset successful. Redirecting...");
                setTimeout(() => navigate("/auth/sign-in"), 2500);
            }
        } catch (err) {
            setServerError(err.response?.data?.message || "Reset failed");
        }
    };

    return (
        <section className="m-8 flex">
            <div className="w-2/5 hidden lg:block">
                <img
                    src="/img/pattern.png"
                    className="h-full w-full object-cover rounded-3xl"
                    alt="Reset Password Background"
                />
            </div>

            <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">
                        Set New Password
                    </Typography>
                    <Typography
                        variant="paragraph"
                        color="blue-gray"
                        className="text-lg font-normal"
                    >
                        Enter and confirm your new password.
                    </Typography>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
                >
                    <div className="mb-1 flex flex-col gap-6">
                        <div>
                            <Typography variant="small" className="mb-1 font-medium">
                                New Password
                            </Typography>
                            <Input
                                {...register("password")}
                                type="password"
                                label="New Password"
                                placeholder="********"
                                error={!!errors.password}
                            />
                            <p className="text-red-500 text-sm">{errors.password?.message}</p>
                        </div>

                        <div>
                            <Typography variant="small" className="mb-1 font-medium">
                                Confirm Password
                            </Typography>
                            <Input
                                {...register("confirmPassword")}
                                type="password"
                                label="Confirm Password"
                                placeholder="********"
                                error={!!errors.confirmPassword}
                            />
                            <p className="text-red-500 text-sm">
                                {errors.confirmPassword?.message}
                            </p>
                        </div>
                    </div>

                    {serverError && (
                        <p className="text-red-500 text-sm mt-2">{serverError}</p>
                    )}
                    {serverSuccess && (
                        <p className="text-green-600 text-sm mt-2">{serverSuccess}</p>
                    )}

                    <Button type="submit" className="mt-6" fullWidth>
                        Reset Password
                    </Button>
                </form>
            </div>
        </section>
    );
}

export default ResetPassword;
