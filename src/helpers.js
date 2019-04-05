const runWithTimer = promise => {
    const timerStart = new Date();
    return promise
        .then(data => {
            const timerEnd = new Date();
            const operationTime = (timerEnd.getTime() - timerStart.getTime()) / 1000;
            return Promise.resolve({operationTime, data});
        });
};

module.exports = { runWithTimer };
