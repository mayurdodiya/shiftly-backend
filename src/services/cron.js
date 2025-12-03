const cron = require("node-cron");
const { NotificationModel } = require("../models");

// Cron job: Runs every night at 11:30 PM
cron.schedule("30 23 * * *", async () => {
    try {
        console.log("Cron job started.")
        let oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const result = await NotificationModel.deleteMany({
            createdAt: { $lt: oneMonthAgo }
        });

        console.log(`🗑️ Deleted ${result.deletedCount} old notifications.`);
    } catch (error) {
        console.error("❌ Error deleting old notifications:", error);
    }
});
