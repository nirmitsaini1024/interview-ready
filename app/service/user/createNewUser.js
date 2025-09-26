

import supabase from '@/lib/supabase/client';

export default async function createNewUser(inputData){
    console.log("input data from create user: ", inputData)
    try{
        const { data, error } = await supabase
            .from('users')
            .insert([{
                clerk_id: inputData.clerk_id,
                name: inputData.name,
                username: inputData.username,
                email: inputData.email,
                img_url: inputData.img_url,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return {
                state: false,
                error: 'Failed to create user in database',
                message: "Database insertion error"
            };
        }

        return {
            state: true,
            data: data[0],
            message: 'User created successfully',
        };
    } catch (err) {
        console.error('User creation error:', err);
        return {
            state: false,
            error: err.message || 'Something went wrong',
            message: 'Failed to create user',
        };
    }
}