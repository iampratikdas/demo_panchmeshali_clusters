import noisereduce as nr
from scipy.io import wavfile

def reduce_noise_in_audio(input_file_path: str, output_file_path: str):
    """
    Reduces background noise in a wav audio file using the noisereduce library.
    
    Args:
        input_file_path (str): Path to the input .wav file.
        output_file_path (str): Path to save the cleaned .wav file
    """
    print(f"Loading audio from {input_file_path}...")
    # Load audio data and the sample rate
    rate, data = wavfile.read(input_file_path)
    
    print("Performing noise reduction...")
    # Perform noise reduction. 
    # 'y' is the audio data, 'sr' is the sample rate.
    # This works for both mono (1D array) and stereo (2D array) audio.
    reduced_noise = nr.reduce_noise(y=data, sr=rate)
    
    print(f"Saving cleaned audio to {output_file_path}...")
    # Save the cleaned output
    wavfile.write(output_file_path, rate, reduced_noise)
    print("Done!")

if __name__ == "__main__":
    # Example usage:
    # Make sure you have a test file named 'noisy_input.wav' in the same folder
    reduce_noise_in_audio("translnoise.wav", "clean_output.wav")
    print("Noise reducer script ready. Call reduce_noise_in_audio() to use.")
