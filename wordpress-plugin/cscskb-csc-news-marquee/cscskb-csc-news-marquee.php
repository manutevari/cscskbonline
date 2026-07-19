<?php
/**
 * Plugin Name: CSCSKB CSC News Marquee
 * Description: Displays an auto-updating CSC headline marquee sourced from official CSC websites, with manually pinned local announcements as a fallback.
 * Version: 1.0.0
 * Author: Ankit Tiwari CSC Center
 * License: GPL-2.0-or-later
 * Text Domain: cscskb-csc-news-marquee
 */

if (!defined('ABSPATH')) {
    exit;
}

const CSCSKB_CSC_NEWS_CACHE_KEY = 'cscskb_csc_news_headlines_v1';
const CSCSKB_CSC_NEWS_CACHE_TTL = 30 * MINUTE_IN_SECONDS;

/**
 * Official CSC-owned sources are checked first so the marquee stays current
 * without copying content from competitor or third-party VLE websites.
 */
function cscskb_csc_news_sources(): array
{
    return [
        'https://csc.gov.in/' => 'CSC Official',
        'https://digitalseva.csc.gov.in/' => 'Digital Seva',
        'https://csc.gov.in/pressreleases' => 'CSC Press Release',
    ];
}

function cscskb_csc_news_fallback_headlines(): array
{
    return [
        [
            'title' => 'Welcome to CSCSKB Online – AI-powered CSC services, knowledge support, reviews, and location help.',
            'url' => home_url('/services/'),
            'source' => 'CSCSKB Online',
        ],
        [
            'title' => 'Visit Ankit Tiwari CSC Center for transparent online government service assistance.',
            'url' => 'https://maps.app.goo.gl/WNidZh1cEukiXna88',
            'source' => 'Location',
        ],
    ];
}

function cscskb_csc_news_fetch(): array
{
    $cached = get_transient(CSCSKB_CSC_NEWS_CACHE_KEY);
    if (is_array($cached) && !empty($cached)) {
        return $cached;
    }

    $headlines = [];

    foreach (cscskb_csc_news_sources() as $url => $source) {
        $response = wp_remote_get($url, [
            'timeout' => 8,
            'redirection' => 5,
            'user-agent' => 'CSCSKB Online News Marquee; ' . home_url('/'),
        ]);

        if (is_wp_error($response)) {
            continue;
        }

        $body = wp_remote_retrieve_body($response);
        if (!is_string($body) || $body === '') {
            continue;
        }

        $headlines = array_merge($headlines, cscskb_csc_news_extract_headlines($body, $url, $source));
        if (count($headlines) >= 8) {
            break;
        }
    }

    $headlines = cscskb_csc_news_unique(array_slice($headlines, 0, 8));
    if (empty($headlines)) {
        $headlines = cscskb_csc_news_fallback_headlines();
    }

    set_transient(CSCSKB_CSC_NEWS_CACHE_KEY, $headlines, CSCSKB_CSC_NEWS_CACHE_TTL);

    return $headlines;
}

function cscskb_csc_news_extract_headlines(string $html, string $base_url, string $source): array
{
    $items = [];

    if (!class_exists('DOMDocument')) {
        return $items;
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query('//a[string-length(normalize-space(.)) > 14] | //h1 | //h2 | //h3 | //li[string-length(normalize-space(.)) > 14]');

    if (!$nodes) {
        return $items;
    }

    foreach ($nodes as $node) {
        $title = cscskb_csc_news_clean_text($node->textContent ?? '');
        if (!cscskb_csc_news_is_useful_title($title)) {
            continue;
        }

        $href = $node instanceof DOMElement ? $node->getAttribute('href') : '';
        $items[] = [
            'title' => $title,
            'url' => cscskb_csc_news_absolute_url($href, $base_url),
            'source' => $source,
        ];

        if (count($items) >= 8) {
            break;
        }
    }

    return $items;
}

function cscskb_csc_news_clean_text(string $text): string
{
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\s+/', ' ', $text) ?? '';

    return trim(wp_strip_all_tags($text));
}

function cscskb_csc_news_is_useful_title(string $title): bool
{
    if (strlen($title) < 15 || strlen($title) > 180) {
        return false;
    }

    $blocked = ['skip to', 'login', 'register', 'copyright', 'privacy policy', 'terms'];
    foreach ($blocked as $word) {
        if (strpos(strtolower($title), $word) !== false) {
            return false;
        }
    }

    return true;
}

function cscskb_csc_news_absolute_url(string $href, string $base_url): string
{
    if ($href === '' || strpos($href, '#') === 0) {
        return $base_url;
    }

    if (strpos($href, 'http://') === 0 || strpos($href, 'https://') === 0) {
        return $href;
    }

    $base = wp_parse_url($base_url);
    if (!is_array($base) || empty($base['scheme']) || empty($base['host'])) {
        return $base_url;
    }

    $path = strpos($href, '/') === 0 ? $href : '/' . ltrim($href, '/');

    return $base['scheme'] . '://' . $base['host'] . $path;
}

function cscskb_csc_news_unique(array $headlines): array
{
    $seen = [];
    $unique = [];

    foreach ($headlines as $headline) {
        $key = strtolower($headline['title'] ?? '');
        if ($key === '' || isset($seen[$key])) {
            continue;
        }

        $seen[$key] = true;
        $unique[] = $headline;
    }

    return $unique;
}

function cscskb_csc_news_marquee_shortcode(): string
{
    $headlines = cscskb_csc_news_fetch();

    ob_start();
    ?>
    <section class="cscskb-news-marquee" aria-label="Latest CSC updates">
        <strong class="cscskb-news-marquee__label">Latest CSC Updates</strong>
        <div class="cscskb-news-marquee__track">
            <?php foreach ($headlines as $headline) : ?>
                <a href="<?php echo esc_url($headline['url']); ?>" target="_blank" rel="noopener noreferrer">
                    <?php echo esc_html($headline['title']); ?>
                    <span><?php echo esc_html($headline['source']); ?></span>
                </a>
            <?php endforeach; ?>
        </div>
    </section>
    <?php

    return ob_get_clean();
}
add_shortcode('cscskb_csc_news_marquee', 'cscskb_csc_news_marquee_shortcode');

function cscskb_csc_news_marquee_styles(): void
{
    ?>
    <style>
        .cscskb-news-marquee{display:flex;gap:1rem;align-items:center;overflow:hidden;padding:.75rem 1rem;border-radius:999px;background:#06142d;color:#fff;box-shadow:0 10px 30px rgba(6,20,45,.18)}
        .cscskb-news-marquee__label{flex:0 0 auto;color:#ff8a00;text-transform:uppercase;letter-spacing:.06em}
        .cscskb-news-marquee__track{display:flex;gap:2rem;min-width:0;white-space:nowrap;animation:cscskbMarquee 35s linear infinite}
        .cscskb-news-marquee:hover .cscskb-news-marquee__track{animation-play-state:paused}
        .cscskb-news-marquee a{color:#fff;text-decoration:none;font-weight:600}
        .cscskb-news-marquee span{margin-left:.4rem;color:#93e05f;font-size:.85em}
        @keyframes cscskbMarquee{from{transform:translateX(20%)}to{transform:translateX(-100%)}}
        @media (prefers-reduced-motion:reduce){.cscskb-news-marquee__track{animation:none;overflow:auto}}
    </style>
    <?php
}
add_action('wp_head', 'cscskb_csc_news_marquee_styles');
