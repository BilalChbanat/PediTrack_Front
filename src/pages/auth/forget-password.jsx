import axiosInstance from "@/api/axiosInstance";
import {
    Card,
    Input,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const schema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
});

export function ForgotPassword() {
    const navigate = useNavigate();
    const [serverMessage, setServerMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            const res = await axiosInstance.post("/auth/forgot-password", { email: data.email });
            setServerMessage("Password reset link sent to your email.");
        } catch (error) {
            setServerMessage(error.response?.data?.message || "Failed to send reset email.");
        }
    };

    return (
        <section className="m-8 flex gap-4">
            <div className="w-full lg:w-3/5 mt-24">
                <div className="text-center">
                    <Typography variant="h2" className="font-bold mb-4">Forgot Password</Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Enter your email to receive password reset instructions.
                    </Typography>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                    <div className="mb-6 flex flex-col gap-6">
                        <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                            Your email
                        </Typography>
                        <Input
                            {...register("email")}
                            type="email"
                            size="lg"
                            placeholder="name@mail.com"
                            error={!!errors.email}
                            labelProps={{ className: "before:content-none after:content-none" }}
                        />
                        {errors.email && (
                            <Typography variant="small" color="red" className="-mt-4">
                                {errors.email.message}
                            </Typography>
                        )}
                    </div>

                    {serverMessage && (
                        <Typography variant="small" color="blue-gray" className="mb-4 text-center">
                            {serverMessage}
                        </Typography>
                    )}

                    <Button type="submit" className="mt-2" fullWidth>
                        Send Reset Link
                    </Button>

                    <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
                        Remembered your password?
                        <a href="/auth/sign-in" className="text-gray-900 ml-1">Sign In</a>
                    </Typography>
                </form>
            </div>

            <div className="w-2/5 h-full hidden lg:block">
                <img
                    src="/img/pattern.png"
                    className="h-full w-full object-cover rounded-3xl"
                    alt="Pattern"
                />
            </div>
        </section>
    );
}

export default ForgotPassword;
