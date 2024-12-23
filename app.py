from flask import Flask, render_template, request, jsonify
import os
import json
from multiprocessing import Pool, cpu_count
from queue import Queue

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_report', methods=['POST'])
def generate_report():
    video_root_dir = request.form['video_root_dir']

    if not video_root_dir:
        return jsonify(error="Nenhuma pasta raiz foi informada."), 400

    try:
      report_data = analyze_video_metadata(video_root_dir)
      report_output = format_report(report_data)
      return jsonify(report=report_output, plots=report_data)
    except Exception as e:
       return jsonify(error=str(e)), 500

def analyze_video_metadata(video_root_dir):
    json_files = []
    for dirpath, _, filenames in os.walk(video_root_dir):
        for filename in filenames:
            if filename.lower().endswith('.json'):
                json_files.append(os.path.join(dirpath, filename))

    if not json_files:
        return {
            "total_size": 0,
            "total_duration": 0,
            "video_durations": [],
            "video_sizes": [],
            "video_resolutions": [],
            "video_formats": [],
            "video_fps": []
        }
    
    pool = Pool(cpu_count())
    results = pool.map(process_json_file, json_files)
    pool.close()
    pool.join()

    total_size = 0
    total_duration = 0
    video_durations = []
    video_sizes = []
    video_resolutions = []
    video_formats = []
    video_fps = []

    for file_data in results:
        if file_data:
            for video_data in file_data:
                total_size += video_data['size']
                if video_data['duration'] is not None:
                    total_duration += video_data['duration']
                    video_durations.append(video_data['duration'])
                    video_sizes.append(video_data['size'])
                    if video_data['resolution']:
                        video_resolutions.append(video_data['resolution'])
                    if video_data['format']:
                        video_formats.append(video_data['format'])
                    if video_data['fps']:
                        video_fps.append(video_data['fps'])

    report_data = {
        "total_size": total_size,
        "total_duration": total_duration,
        "video_durations": video_durations,
        "video_sizes": video_sizes,
        "video_resolutions": video_resolutions,
        "video_formats": video_formats,
        "video_fps": video_fps
    }
    return report_data

def process_json_file(file_path):
     try:
         with open(file_path, 'r', encoding='utf-8') as file:
              json_data = json.load(file)
              videos = []
              if "data" in json_data:
                for item in json_data["data"]:
                   if "attributes" in item and "video_metadata" in item["attributes"]:
                        metadata = item["attributes"]["video_metadata"]
                        videos.append({
                             'size': metadata.get('size', 0),
                            'duration': metadata.get('duration', None),
                            'resolution': metadata.get('resolution', None),
                             'format': metadata.get('format', None),
                            'fps': metadata.get('fps', None)
                          })
              return videos
     except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None
     except Exception as e:
        print(f"Error processing file {file_path}: {e}")
        return None

def format_report(report_data):
    output = []
    output.append("📊 Resumo Geral\n")
    output.append("-----------------------------------\n")

    video_count = len(report_data["video_sizes"])
    output.append(f"   - Número total de vídeos: {format_number(video_count)}\n")

    total_size_bytes = report_data['total_size']
    size_str, unit = format_size(total_size_bytes)
    output.append(f"   - Tamanho total dos vídeos: {size_str} {unit}\n")

    total_duration_seconds = report_data['total_duration']
    duration_str = format_duration(total_duration_seconds)
    output.append(f"   - Tempo total dos vídeos: {duration_str}\n")

    output.append("-----------------------------------\n\n")
    return "".join(output)

def format_number(number):
    return f"{number:,}".replace(",", ".")

def format_size(size_bytes):
    size_kb = size_bytes / 1024
    if size_kb < 1024:
        return f"{size_kb:.2f}", "KB"
    size_mb = size_kb / 1024
    if size_mb < 1024:
        return f"{size_mb:.2f}", "MB"
    size_gb = size_mb / 1024
    if size_gb < 1024:
      return f"{size_gb:.2f}", "GB"
    size_tb = size_gb/1024
    return f"{size_tb:.2f}", "TB"


def format_duration(duration_seconds):
    if duration_seconds < 60:
        return f"{int(duration_seconds)} segundos"
    
    minutes = int(duration_seconds // 60)
    if minutes < 60:
        return f"{minutes} minutos"
    
    hours = int(minutes // 60)
    minutes = int(minutes % 60)
    if hours < 24:
        return f"{hours} horas e {minutes} minutos"
    
    days = int(hours // 24)
    hours = int(hours % 24)
    
    return f"{days} dias, {hours} horas e {minutes} minutos"

if __name__ == '__main__':
    app.run(debug=True)
