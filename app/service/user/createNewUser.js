

import { prisma } from '@/lib/prisma/client';

export default async function createNewUser(inputData){
    console.log("input data from create user: ", inputData)
    try{
        const data = await prisma.user.create({
            data: {
                clerk_id: inputData.clerk_id,
                name: inputData.name,
                username: inputData.username,
                email: inputData.email,
                img_url: inputData.img_url,
            }
        });

        return {
            state: true,
            data: data,
            message: 'User created successfully',
        };
    } catch (err) {
        console.error('User creation error:', err);
        // Handle unique constraint violations
        if (err.code === 'P2002') {
            return {
                state: false,
                error: 'User already exists',
                message: 'User already exists in database'
            };
        }
        return {
            state: false,
            error: err.message || 'Something went wrong',
            message: 'Failed to create user',
        };
    }
}