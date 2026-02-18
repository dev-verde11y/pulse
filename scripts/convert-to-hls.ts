import { spawn, execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

/**
 * CONFIGURATION
 * Adjust these values before running the script
 * npx tsx scripts/convert-to-hls.ts
 */
const INPUT_FILE = String.raw`C:\Users\verde\Downloads\testes\kaiju-no-8_season-1_episode-1.mp4`
const OUTPUT_DIR = String.raw`C:\Users\verde\Downloads\kaiju-no-8\output`

async function runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Running: ${command} ${args.join(' ')}\n`)
        const process = spawn(command, args, { stdio: 'inherit' })

        process.on('close', (code) => {
            if (code === 0) resolve()
            else reject(new Error(`Command failed with code ${code}`))
        })
    })
}

function getSubtitleStreams(inputFile: string): { index: number, lang: string }[] {
    try {
        const output = execSync(
            `ffprobe -v error -select_streams s -show_entries stream=index:stream_tags=language -of csv=p=0 "${inputFile}"`,
            { encoding: 'utf8' }
        )

        return output.trim().split(/\r?\n/).filter(line => line.trim() !== '').map(line => {
            const [index, lang] = line.split(',')
            return { index: parseInt(index), lang: lang || 'und' }
        })
    } catch (error) {
        console.warn('⚠️ Warning: Could not detect subtitle streams with ffprobe. Using default 0:2.')
        return [{ index: 2, lang: 'und' }]
    }
}

function getAudioStreams(inputFile: string): { index: number, lang: string, title: string }[] {
    try {
        const output = execSync(
            `ffprobe -v error -select_streams a -show_entries stream=index:stream_tags=language,title -of csv=p=0 "${inputFile}"`,
            { encoding: 'utf8' }
        )

        return output.trim().split(/\r?\n/).filter(line => line.trim() !== '').map(line => {
            const [index, lang, title] = line.split(',')
            return {
                index: parseInt(index),
                lang: lang || 'und',
                title: title || (lang === 'por' ? 'Português' : lang === 'jpn' ? 'Japonês' : 'Audio ' + index)
            }
        })
    } catch (error) {
        console.warn('⚠️ Warning: Could not detect audio streams with ffprobe. Using default 0:1.')
        return [{ index: 1, lang: 'por', title: 'Português' }]
    }
}

async function main() {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`❌ Input file not found: ${INPUT_FILE}`)
        process.exit(1)
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    try {
        // 1. Extract All Subtitles
        console.log('--- 📝 Discovering and Extracting Subtitles ---')
        const streams = getSubtitleStreams(INPUT_FILE)
        console.log(`Found ${streams.length} subtitle tracks.`)

        for (const stream of streams) {
            const vttName = `subtitle_${stream.lang}.vtt`
            const vttPath = path.join(OUTPUT_DIR, vttName)
            console.log(`\n🔹 Extracting ${stream.lang} (Stream 0:${stream.index}) to ${vttName}...`)

            await runCommand('ffmpeg', [
                '-i', INPUT_FILE,
                '-map', `0:${stream.index}`,
                vttPath,
                '-y'
            ])
        }

        // 2. Convert to HLS (Multi-bitrate + Multi-audio)
        console.log('\n--- 🎬 Converting to HLS (1080p + 720p + Multi-Audio) ---')
        const audioStreams = getAudioStreams(INPUT_FILE)
        console.log(`Found ${audioStreams.length} audio tracks.`)

        const ffmpegArgs = [
            '-i', INPUT_FILE,
            '-filter_complex', '[0:v]split=2[v1080][v720]; [v1080]scale=w=1920:h=1080[v1080out]; [v720]scale=w=1280:h=720[v720out]',
            '-map', '[v1080out]', '-c:v:0', 'libx264', '-preset', 'veryfast', '-b:v:0', '5000k', '-maxrate:v:0', '5350k', '-bufsize:v:0', '7500k',
            '-map', '[v720out]', '-c:v:1', 'libx264', '-preset', 'veryfast', '-b:v:1', '2800k', '-maxrate:v:1', '2996k', '-bufsize:v:1', '4200k',
        ]

        // Map all audio streams
        audioStreams.forEach((audio, i) => {
            ffmpegArgs.push('-map', `0:${audio.index}`, `-c:a:${i}`, 'aac', `-b:a:${i}`, '128k', '-ac', '2')
            ffmpegArgs.push(`-metadata:s:a:${i}`, `language=${audio.lang}`, `-metadata:s:a:${i}`, `title=${audio.title}`)
        })

        // Build var_stream_map
        // v:0,a:0 v:0,a:1 v:1,a:0 v:1,a:1 etc? 
        // No, standard HLS multi-audio uses groups
        // e.g. -var_stream_map "v:0,agroup:audio v:1,agroup:audio"
        // And we need to define the audio groups

        let varStreamMap = 'v:0,name:1080p,agroup:audio v:1,name:720p,agroup:audio'
        audioStreams.forEach((audio, i) => {
            varStreamMap += ` a:${i},agroup:audio,language:${audio.lang},default:${i === 0 ? 'YES' : 'NO'}`
        })

        ffmpegArgs.push(
            '-f', 'hls',
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-hls_flags', 'independent_segments',
            '-hls_segment_type', 'mpegts',
            '-hls_segment_filename', path.join(OUTPUT_DIR, 'v%v', 'seg%03d.ts').replace(/\\/g, '/'),
            '-master_pl_name', 'master.m3u8',
            '-var_stream_map', varStreamMap,
            path.join(OUTPUT_DIR, 'v%v', 'index.m3u8').replace(/\\/g, '/'),
            '-y'
        )

        await runCommand('ffmpeg', ffmpegArgs)

        console.log('\n✨ Conversion completed successfully!')
        console.log(`📂 Output located at: ${OUTPUT_DIR}`)
    } catch (error) {
        console.error('\n❌ Fatal error during conversion:', error)
        process.exit(1)
    }
}

main()
