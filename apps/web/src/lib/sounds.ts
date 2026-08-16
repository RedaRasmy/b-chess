import { Howl } from 'howler';

const sounds = {
    gameStart: new Howl({ src: ['/sounds/game-start.mp3'] }),
    move: new Howl({ src: ['/sounds/move.mp3'] }),
    // illegal: new Howl({ src: ["/sounds/illegal.mp3"] }),
    capture: new Howl({ src: ['/sounds/capture.mp3'] }),
    check: new Howl({ src: ['/sounds/check.mp3'] }),
    castle: new Howl({ src: ['/sounds/castle.mp3'] }),
    promote: new Howl({ src: ['/sounds/promote.mp3'] }),
    timeoutAlert: new Howl({ src: ['/sounds/timeout-alert.mp3'] }),
    gameEnd: new Howl({ src: ['/sounds/game-end.mp3'] }),
};

export type Sound = keyof typeof sounds;

export type MoveSound = Exclude<Sound, 'gameStart' | 'gameEnd' | 'timeoutAlert'>;

export function playSound(sound: Sound) {
    sounds[sound].play();
}
