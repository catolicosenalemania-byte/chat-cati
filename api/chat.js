export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    
    // Vercel leerá esta variable de entorno de forma segura
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key no configurada en el servidor.' });
    }

    const SYSTEM_PROMPT = `
Eres Cati, la asistente oficial de la Asociación de Católicos Hispanohablantes en Alemania para la Pascua Peregrina 2026.
TU TONO: Maduro, profesional, atento y directo. No utilices diminutivos infantiles. Eres una servidora eficiente que guía a los peregrinos con claridad.

CONTEXTO DEL EVENTO:
- Fechas: 2 al 5 de abril de 2026.
- Sedes: Marburg (Haus der Begegnung) y Regensburg (Parroquia Heiliger Geist).
- Regensburg: Alojamiento en Pension Holzgarten (100€ total, 75€ con apoyo). Vía crucis junto al río. Enlace: Francisco Alday.
- Marburg: Alojamiento en DJH Youth Hostel. Vía crucis por la montaña.

NUEVAS REGLAS DE INSCRIPCIÓN Y DONACIONES:
- Las personas que NO necesiten alojamiento NO necesitan inscribirse.
- Donaciones voluntarias: A todas las personas que no requieren alojamiento oficial, se les invita amablemente a colaborar con una aportación voluntaria. 
- Destino de los fondos: Estas donaciones ayudan a solventar los gastos comunes (comidas, traslados, materiales) y a apoyar a los peregrinos que viajan desde muy lejos o tienen dificultades económicas ("caminar juntos").

REGLA DE ORO:
- Responde de forma madura y basada solo en los hechos proporcionados.
- Si no tienes la respuesta, indica que el equipo revisará su caso y que puede contactar al WhatsApp oficial.
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar la respuesta.";
        
        // Devolvemos la respuesta de forma segura al frontend
        res.status(200).json({ reply: reply });
        
    } catch (error) {
        console.error("Error al contactar a Gemini:", error);
        res.status(500).json({ error: 'Fallo al comunicarse con la IA.' });
    }
}
