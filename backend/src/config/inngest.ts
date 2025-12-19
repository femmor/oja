import { Inngest } from "inngest";
import User from "../models/user.model";
import appConfig from "./env";

// Create a client to send and receive events
export const inngest = new Inngest({
    id: "oja-commerce",
    eventKey: appConfig.INNGEST_EVENT_KEY
});

// Create Inngest functions to handle Clerk user events
// Function to sync user data to MongoDB on user creation
const syncUser = inngest.createFunction(
    { id: 'sync-user-to-db', name: 'Sync Clerk User to MongoDB' },
    { event: "clerk/user.created" },
    async ({ event }) => {
        const { id, email_addresses, first_name, last_name, profile_image_url } = event.data;

        const existingUser = await User.findOne({ clerkId: id });
        if (existingUser) {
            console.log(`User with Clerk ID ${id} already exists`);
            return;
        }

        // Create new user
        const newUser = {
            clerkId: id,
            email: email_addresses[0]?.email_address,
            name: `${first_name} ${last_name}`,
            imageUrl: profile_image_url,
            addresses: [],
            wishlist: []
        };

        await User.create(newUser);
        console.log(`Created new user with Clerk ID ${id}`);
    }
);

// Function to handle user deletion
const deleteUserFromDB = inngest.createFunction(
    { id: 'delete-user-from-db', name: 'Delete Clerk User from MongoDB' },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const { id } = event.data;

        const deletedUser = await User.findOneAndDelete({ clerkId: id });
        if (deletedUser) {
            console.log(`User with Clerk ID ${id} deleted from MongoDB`);
        } else {
            console.log(`No user found with Clerk ID ${id} to delete`);
        }
    }
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUser,
    deleteUserFromDB
];