"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const MAX_HLS_RECOVERY_ATTEMPTS = 6;
const PLAYBACK_TIMEOUT_MS = 15000;

export default function AdaptiveVideoPlayer({ videoUrl, title, large }) {
  const [status, setStatus] = useState("initializing");
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const mjpegIntervalRef = useRef(null);
  const hlsRecoveryAttemptsRef = useRef(0);
  const hlsReconnectAttemptsRef = useRef(0);
  const hlsReconnectTimeoutRef = useRef(null);
  const playbackTimeoutRef = useRef(null);
  const timeoutIncidentOpenRef = useRef(false);

  const clearPlaybackTimeout = () => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
  };

  const resetPlaybackState = () => {
    clearPlaybackTimeout();
    timeoutIncidentOpenRef.current = false;
  };

  const armPlaybackTimeout = (reason) => {
    if (timeoutIncidentOpenRef.current) return;

    clearPlaybackTimeout();
    setStatus("loading");

    playbackTimeoutRef.current = setTimeout(() => {
      if (timeoutIncidentOpenRef.current) return;
      timeoutIncidentOpenRef.current = true;
      console.warn(`Playback timeout ${PLAYBACK_TIMEOUT_MS}ms (${reason})`);
      setStatus("play-error");
    }, PLAYBACK_TIMEOUT_MS);
  };

  const clearVideoHandlers = (video) => {
    if (!video) return;
    video.onwaiting = null;
    video.onstalled = null;
    video.onplaying = null;
    video.oncanplay = null;
    video.onloadedmetadata = null;
    video.onerror = null;
  };

  const bindCommonVideoHandlers = (video) => {
    clearVideoHandlers(video);
    video.onwaiting = () => armPlaybackTimeout("video waiting");
    video.onstalled = () => armPlaybackTimeout("video stalled");
    video.onplaying = () => {
      resetPlaybackState();
      hlsRecoveryAttemptsRef.current = 0;
      hlsReconnectAttemptsRef.current = 0;
      setStatus("playing");
    };
  };

  const cleanupPlayer = () => {
    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (mjpegIntervalRef.current) {
      clearInterval(mjpegIntervalRef.current);
      mjpegIntervalRef.current = null;
    }

    if (hlsReconnectTimeoutRef.current) {
      clearTimeout(hlsReconnectTimeoutRef.current);
      hlsReconnectTimeoutRef.current = null;
    }

    if (video) {
      clearVideoHandlers(video);
      if (video.parentElement) {
        const mjpegImg = video.parentElement.querySelector(".mjpeg-img");
        if (mjpegImg) mjpegImg.remove();
      }
      video.style.display = "";
    }

    resetPlaybackState();
  };

  const detectVideoFormat = async (url) => {
    setStatus("detecting");

    try {
      const urlLower = url.toLowerCase();
      if (urlLower.includes(".m3u8")) return { format: "hls" };
      if (urlLower.includes(".mp4")) return { format: "mp4" };
      if (urlLower.includes(".webm")) return { format: "webm" };

      let contentType = null;
      try {
        const response = await fetch(url, { method: "HEAD", mode: "cors" });
        contentType = response.headers.get("content-type") || "";
      } catch {
        contentType = null;
      }

      if (contentType) {
        if (
          contentType.includes("application/vnd.apple.mpegurl") ||
          contentType.includes("application/x-mpegURL")
        ) {
          return { format: "hls" };
        }
        if (contentType.includes("video/mp4")) return { format: "mp4" };
        if (contentType.includes("video/webm")) return { format: "webm" };
        if (
          contentType.includes("image/jpeg") ||
          contentType.includes("multipart/x-mixed-replace")
        ) {
          return { format: "mjpeg" };
        }
      }

      return await new Promise((resolve) => {
        const testVideo = document.createElement("video");
        testVideo.muted = true;
        testVideo.preload = "metadata";

        let resolved = false;
        const timeoutId = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          resolve({ format: "mjpeg" });
        }, 3000);

        testVideo.addEventListener("loadedmetadata", () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ format: "video" });
        });

        testVideo.addEventListener("error", () => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ format: "mjpeg" });
        });

        testVideo.src = url;
      });
    } catch {
      return { format: "unknown" };
    }
  };

  const scheduleHLSReconnect = (reason) => {
    setStatus("loading");
    hlsRecoveryAttemptsRef.current = 0;
    hlsReconnectAttemptsRef.current += 1;

    const reconnectDelay = Math.min(1000 * hlsReconnectAttemptsRef.current, 5000);

    if (hlsReconnectTimeoutRef.current) {
      clearTimeout(hlsReconnectTimeoutRef.current);
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    hlsReconnectTimeoutRef.current = setTimeout(() => {
      if (!videoRef.current) return;
      initHLSPlayer();
    }, reconnectDelay);

    if (reason) {
      armPlaybackTimeout(`hls reconnect: ${reason}`);
    }
  };

  const initHLSPlayer = () => {
    const video = videoRef.current;
    if (!video) return;

    bindCommonVideoHandlers(video);
    video.style.display = "";

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 0,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 3,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 3
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_LOADED, () => {
        setStatus("ready");
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        timeoutIncidentOpenRef.current = false;
        armPlaybackTimeout("HLS play start");
        video.muted = true;
        video
          .play()
          .then(() => {
            resetPlaybackState();
            hlsRecoveryAttemptsRef.current = 0;
            hlsReconnectAttemptsRef.current = 0;
            setStatus("playing");
          })
          .catch(() => {
            clearPlaybackTimeout();
            setStatus("play-error");
          });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        const detail = data?.details || "unknown";
        const isFragmentError = detail.includes("frag") || detail.includes("bufferStalled");

        if (isFragmentError) {
          hlsRecoveryAttemptsRef.current += 1;
          armPlaybackTimeout("HLS missing segment");
          if (hlsRecoveryAttemptsRef.current > MAX_HLS_RECOVERY_ATTEMPTS) {
            scheduleHLSReconnect(`segment issue: ${detail}`);
            return;
          }
          hls.startLoad(-1);
          return;
        }

        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsRecoveryAttemptsRef.current += 1;
          armPlaybackTimeout("HLS network recovery");
          if (hlsRecoveryAttemptsRef.current > MAX_HLS_RECOVERY_ATTEMPTS) {
            scheduleHLSReconnect(`network issue: ${detail}`);
            return;
          }
          hls.startLoad(-1);
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsRecoveryAttemptsRef.current += 1;
          armPlaybackTimeout("HLS media recovery");
          if (hlsRecoveryAttemptsRef.current > MAX_HLS_RECOVERY_ATTEMPTS) {
            scheduleHLSReconnect(`media issue: ${detail}`);
            return;
          }
          hls.recoverMediaError();
          return;
        }

        scheduleHLSReconnect(`fatal: ${detail}`);
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.muted = true;
      video.oncanplay = () => {
        setStatus("ready");
        timeoutIncidentOpenRef.current = false;
        armPlaybackTimeout("native HLS play start");
        video
          .play()
          .then(() => {
            resetPlaybackState();
            setStatus("playing");
          })
          .catch(() => {
            clearPlaybackTimeout();
            setStatus("play-error");
          });
      };
    }
  };

  const initStandardVideoPlayer = () => {
    const video = videoRef.current;
    if (!video) return;

    bindCommonVideoHandlers(video);
    video.style.display = "";
    video.src = videoUrl;
    video.muted = true;

    video.onloadedmetadata = () => {
      setStatus("ready");
    };

    video.oncanplay = () => {
      timeoutIncidentOpenRef.current = false;
      armPlaybackTimeout("standard video play start");
      video
        .play()
        .then(() => {
          resetPlaybackState();
          setStatus("playing");
        })
        .catch(() => {
          clearPlaybackTimeout();
          setStatus("play-error");
        });
    };

    video.onerror = () => {
      setStatus("error");
    };
  };

  const initMJPEGPlayer = () => {
    const video = videoRef.current;
    if (!video || !video.parentElement) return;

    clearVideoHandlers(video);
    video.style.display = "none";

    const container = video.parentElement;
    let mjpegImg = container.querySelector(".mjpeg-img");

    if (!mjpegImg) {
      mjpegImg = document.createElement("img");
      mjpegImg.className = "mjpeg-img w-full h-auto bg-stone-800";
      mjpegImg.style.minHeight = large ? "415px" : "208px";
      container.appendChild(mjpegImg);
    }

    const refreshMJPEG = () => {
      const timestamp = Date.now();
      mjpegImg.src = `${videoUrl}?t=${timestamp}`;
    };

    mjpegImg.onload = () => {
      resetPlaybackState();
      setStatus("playing");
    };

    mjpegImg.onerror = () => {
      setStatus("error");
    };

    setStatus("ready");
    refreshMJPEG();
    mjpegIntervalRef.current = setInterval(refreshMJPEG, 100);
  };

  const initializePlayer = (format) => {
    if (format === "hls") {
      initHLSPlayer();
      return;
    }

    if (format === "mp4" || format === "webm" || format === "video") {
      initStandardVideoPlayer();
      return;
    }

    if (format === "mjpeg") {
      initMJPEGPlayer();
      return;
    }

    initStandardVideoPlayer();
  };

  useEffect(() => {
    if (!videoUrl) {
      cleanupPlayer();
      setStatus("no-url");
      return () => {};
    }

    let isMounted = true;

    const initializeVideo = async () => {
      if (!isMounted) return;
      if (!videoRef.current) {
        setTimeout(initializeVideo, 100);
        return;
      }

      const detection = await detectVideoFormat(videoUrl);
      if (!isMounted) return;
      initializePlayer(detection.format);
    };

    initializeVideo();

    return () => {
      isMounted = false;
      cleanupPlayer();
    };
  }, [videoUrl]);

  const isSkeletonVisible =
    status === "initializing" || status === "detecting" || status === "loading";

  const getStatusColor = () => {
    if (status === "playing") return "bg-green-500";
    if (status === "ready") return "bg-blue-500";
    if (status === "detecting" || status === "loading" || status === "initializing") {
      return "bg-yellow-500";
    }
    if (status === "error" || status === "play-error") return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <div className="bg-black text-white py-1.5">
      <div className="flex items-center gap-1 p-2 m-1 text-xs">
        <div className="w-full flex justify-between">
          <span className="font-semibold">{title}</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="font-semibold">Status: {status}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          className={`w-full h-auto ${large ? "min-h-[415px]" : "min-h-52"} bg-black`}
          controls
          muted
          playsInline
          onError={() => setStatus("error")}
          style={{ backgroundColor: "black", width: "100%", height: "100%" }}
        />

        {isSkeletonVisible && (
          <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-stone-900/90 px-4 animate-pulse">
            <div className="h-3 w-40 rounded bg-stone-700" />
            <div className="h-3 w-28 rounded bg-stone-700" />
            <div className="h-3 w-52 rounded bg-stone-700" />
            <div className="text-xs text-stone-300 pt-1">Memuat stream kamera...</div>
          </div>
        )}
      </div>
    </div>
  );
}
