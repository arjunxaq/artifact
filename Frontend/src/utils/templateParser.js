export function extractPlaceholders(html) {
    const regex = /{{\s*(.*?)\s*}}/g;
    const matches = [...html.matchAll(regex)];

    const fields = new Set();

    matches.forEach(match => {
        fields.add(match[1]);
    });

    return Array.from(fields);
}