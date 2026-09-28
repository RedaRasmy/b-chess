import Link from 'next/link';

export default function ApprovalLabel() {
    return (
        <span className="text-sm leading-snug">
            I am 13+ and agree to the{' '}
            <Link
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary font-medium underline underline-offset-4 hover:opacity-80"
            >
                Terms of Service
            </Link>{' '}
            and{' '}
            <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary font-medium underline underline-offset-4 hover:opacity-80"
            >
                Privacy Policy
            </Link>
        </span>
    );
}
