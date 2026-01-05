import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Forgot Password",
    description: "Request a password reset link for your Network32 account.",
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
