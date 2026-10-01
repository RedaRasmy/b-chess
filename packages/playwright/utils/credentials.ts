export function getCredentials(timestamp: number) {
    return {
        username: `${timestamp}`,
        email: `test_user_${timestamp}@example.com`,
        password: 'password123',
    };
}
