const Progress = require("../models/Progress");
const User = require("../models/User");

const DAY_MS = 24 * 60 * 60 * 1000;
const round2 = (n) => Math.round(n * 100) / 100;

// Date as "YYYY-MM-DD" in Indian time, so a day starts at midnight IST
const istDate = (date) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);

// Adds one answer to the right entry in a stats list (creates it if new)
const bump = (list, refId, isCorrect, when) => {
    if (!refId) return;
    let stat = list.find((s) => String(s.refId) === String(refId));
    if (!stat) {
        list.push({ refId, attempted: 0, correct: 0, accuracy: 0 });
        stat = list[list.length - 1];
    }
    stat.attempted += 1;
    if (isCorrect) stat.correct += 1;
    stat.accuracy = round2((stat.correct / stat.attempted) * 100);
    stat.lastAttemptAt = when;
};

// Practice streak: +1 if they also practised yesterday, reset to 1 if they skipped a day
const updateStreak = async (userId, now) => {
    const user = await User.findById(userId).select("streak").lean();
    if (!user) return;

    const streak = user.streak || { current: 0, longest: 0 };
    const today = istDate(now);
    const yesterday = istDate(new Date(now.getTime() - DAY_MS));
    const lastDay = streak.lastActiveDate ? istDate(new Date(streak.lastActiveDate)) : null;

    if (lastDay === today) return; // already counted today

    const current = lastDay === yesterday ? (streak.current || 0) + 1 : 1;
    const longest = Math.max(streak.longest || 0, current);

    await User.updateOne(
        { _id: userId },
        { $set: { streak: { current, longest, lastActiveDate: now } } }
    );
};

const updateProgress = async (attempt) => {
    const now = attempt.submittedAt || new Date();

    let progress = await Progress.findOne({ userId: attempt.userId, examId: attempt.examId });
    if (!progress) {
        progress = new Progress({ userId: attempt.userId, examId: attempt.examId });
    }

    const wrong = new Set(progress.wrongQuestionIds.map(String));
    let attempted = 0;
    let correct = 0;

    for (const answer of attempt.answers) {
        if (answer.isCorrect === null) continue; // skipped questions don't count

        attempted++;
        if (answer.isCorrect) correct++;

        bump(progress.subjects, answer.subjectId, answer.isCorrect, now);
        bump(progress.chapters, answer.chapterId, answer.isCorrect, now);
        bump(progress.topics, answer.topicId, answer.isCorrect, now);

        // Wrong answers go on the list; a correct answer later takes it off
        const key = String(answer.questionId);
        if (answer.isCorrect) wrong.delete(key);
        else wrong.add(key);
    }

    // Overall totals
    progress.totals.attempted += attempted;
    progress.totals.correct += correct;
    progress.totals.incorrect += attempted - correct;
    progress.totals.timeSec += attempt.result?.timeTakenSec || 0;
    progress.totals.testsTaken += 1;

    // Today's activity
    const today = istDate(now);
    let day = progress.daily.find((d) => d.date === today);
    if (!day) {
        progress.daily.push({ date: today, attempted: 0, correct: 0, timeSec: 0 });
        day = progress.daily[progress.daily.length - 1];
    }
    day.attempted += attempted;
    day.correct += correct;
    day.timeSec += attempt.result?.timeTakenSec || 0;

    // Keep only the last 90 days
    if (progress.daily.length > 90) {
        progress.daily = progress.daily
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-90);
    }

    // Keep at most 2000 wrong questions (the newest ones)
    progress.wrongQuestionIds = [...wrong].slice(-2000);

    await progress.save();

    if (attempted > 0) await updateStreak(attempt.userId, now);
};

module.exports = { updateProgress, istDate };