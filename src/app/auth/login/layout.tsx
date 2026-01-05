import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Log In",
    description: "Sign in to your Network32 account to connect with peers and access clinical cases.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
