package middleware

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	visitors = make(map[string]*visitor)
	mu       sync.Mutex
)

// cleanupVisitors runs in the background and removes stale visitors
func init() {
	go func() {
		for {
			time.Sleep(time.Minute)
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > 3*time.Minute {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

func getVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	v, exists := visitors[ip]
	if !exists {
		// Allow 5 requests per minute, with a burst of 10
		limiter := rate.NewLimiter(rate.Every(time.Minute/5), 10)
		visitors[ip] = &visitor{limiter, time.Now()}
		return limiter
	}

	v.lastSeen = time.Now()
	return v.limiter
}

func extractIP(r *http.Request) string {
	ipStr := r.Header.Get("X-Forwarded-For")
	if ipStr != "" {
		ipStr = strings.Split(ipStr, ",")[0]
		ipStr = strings.TrimSpace(ipStr)
	} else {
		ipStr = r.RemoteAddr
	}

	host, _, err := net.SplitHostPort(ipStr)
	if err == nil {
		ipStr = host
	}
	return ipStr
}

// RateLimit is an in-memory IP-based rate limiter middleware
// TODO: Replace this in-memory map with a Redis-based rate limiter for production scale
// and distributed instances.
func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := extractIP(r)
		limiter := getVisitor(ip)
		
		if !limiter.Allow() {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "too many requests, please try again later",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}
