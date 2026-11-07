/*
 *  an_animation.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-05-04.
 *
 *  SYNOPSIS:
 *      The module for animating various in-engine objects.
 */
(function () {
    var runningAnimations = {};
    var queuedAnimations = {};
    function AN_GenerateAnimationId(candidateId, goingIntoQueue) {
        var candidate = candidateId || "(anonymous)";
        if (goingIntoQueue)
            return queuedAnimations[candidate]
                ? AN_GenerateAnimationId(candidate + "_1")
                : candidate;
        return runningAnimations[candidate]
            ? AN_GenerateAnimationId(candidate + "_1")
            : candidate;
    }
    function AN_CancelAnimation(id, cleanUp) {
        clearInterval(runningAnimations[id]);
        delete runningAnimations[id];
        if (cleanUp)
            cleanUp();
    }
    function AN_OnFrame(_a) {
        var animationIndex = _a.animationIndex, id = _a.id, onFrame = _a.onFrame, shouldEnd = _a.shouldEnd, cleanUp = _a.cleanUp;
        var index = animationIndex[0]++;
        if (shouldEnd && shouldEnd(index))
            AN_CancelAnimation(id, cleanUp);
        else
            onFrame(index);
    }
    function AN_StartAnimation(onFrame, interval, shouldEnd, cleanUp) {
        var id = AN_GenerateAnimationId(arguments.callee.caller.name);
        var animationIndex = new Uint32Array(1);
        var args = { animationIndex: animationIndex, id: id, onFrame: onFrame, shouldEnd: shouldEnd, cleanUp: cleanUp };
        runningAnimations[id] = setInterval(AN_OnFrame, interval, args);
        return id;
    }
    function AN_QueueAnimation(onFrame, interval, shouldEnd, cleanUp) {
        var id = AN_GenerateAnimationId(arguments.callee.caller.name, 1);
        var animationIndex = new Uint32Array(1);
        var args = { animationIndex: animationIndex, id: id, onFrame: onFrame, shouldEnd: shouldEnd, cleanUp: cleanUp };
        var boundOnFrame = AN_OnFrame.bind(undefined, args);
        queuedAnimations[id] = { onFrame: boundOnFrame, interval: interval };
        return id;
    }
    function AN_RunQueuedAnimation(id) {
        var animation = queuedAnimations[id];
        if (!animation)
            return;
        var onFrame = animation.onFrame, interval = animation.interval;
        runningAnimations[id] = setInterval(onFrame, interval);
        delete queuedAnimations[id];
    }
    window.__import__AN_Animation = function () {
        return {
            AN_StartAnimation: AN_StartAnimation,
            AN_CancelAnimation: AN_CancelAnimation,
            AN_QueueAnimation: AN_QueueAnimation,
            AN_RunQueuedAnimation: AN_RunQueuedAnimation,
        };
    };
})();
