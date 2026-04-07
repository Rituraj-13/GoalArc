const AIResponse = async (title) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/todos/generate-description`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('todoToken')}`
            },
            body: JSON.stringify({ title })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        return data.description;
    } catch (error) {
        console.error('Error generating AI response:', error);
        return 'Failed to generate description';
    }
}

export default AIResponse;
