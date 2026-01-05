import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Join Network32",
    description: "Create your free account on Network32 and start connecting with dental professionals today.",
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
