import os
import subprocess
import tempfile
from pathlib import Path
import noisereduce as nr
from scipy.io import wavfile

def reduce_noise_in_audio(input_file_path: str, output_file_path: str):
    """
    Reduces background noise in an audio file using a 2-step process:
    1. Demucs AI model extracts the clean 'vocals' stem.
    2. noisereduce library applies a secondary spectral gating pass for final polish.
    
    Args:
        input_file_path (str): Path to the input audio file.
        output_file_path (str): Path to save the cleaned .wav file.
    """
    print(f"Loading audio from {input_file_path}...")
    
    input_path = Path(input_file_path)
    
    # Demucs outputs to a specific folder structure, so we'll use a temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        print("Step 1: Performing AI noise reduction with Demucs (this may take a moment)...")
        
        command = [
            "python", "-m", "demucs.separate",
            "-n", "htdemucs", 
            "--two-stems=vocals",
            "-o", temp_dir,
            str(input_path)
        ]
        
        try:
            subprocess.run(command, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print("Error running Demucs!")
            print(e.stderr)
            raise
        
        track_name = input_path.stem
        extracted_vocals_path = Path(temp_dir) / "htdemucs" / track_name / "vocals.wav"
        
        if extracted_vocals_path.exists():
            print("Step 2: Performing secondary noise reduction pass with noisereduce library...")
            # Load the AI-cleaned audio
            rate, data = wavfile.read(extracted_vocals_path)
            
            # scipy.io.wavfile reads stereo audio as (samples, channels)
            # but noisereduce expects (channels, samples).
            is_stereo = len(data.shape) == 2
            if is_stereo:
                data = data.T
            
            # Apply noisereduce for a final polish
            final_cleaned_audio = nr.reduce_noise(y=data, sr=rate)
            
            # Transpose back to (samples, channels) for saving
            if is_stereo:
                final_cleaned_audio = final_cleaned_audio.T
            
            print(f"Saving final cleaned audio to {output_file_path}...")
            # Save the final output
            wavfile.write(output_file_path, rate, final_cleaned_audio)
            print("Done!")
        else:
            raise FileNotFoundError(f"Demucs completed, but could not find the output file at {extracted_vocals_path}")

if __name__ == "__main__":
    # Example usage:
    reduce_noise_in_audio("musicback.ogg", "clean_output.mp3")
    print("Noise reducer script ready. Call reduce_noise_in_audio() to use.")
