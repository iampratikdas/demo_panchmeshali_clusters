import { useSound } from 'react-sounds';

export const useSounds = () => {
    const { play: successPlay } = useSound('notification/success');
    const { play: errorPlay } = useSound('notification/error');
    const { play: bootPlay } = useSound('system/boot_up');
    const { play: buttonPlay } = useSound('ui/button_soft_double');
    const { play: buttonClick } = useSound('ui/button_click');
    return { successPlay, errorPlay, bootPlay, buttonPlay, buttonClick };
}
