import React from 'react'

function Footer() {
    return (
        <>
            <div className="mt-auto text-center py-6 border-t items-center min-w-full bt">
                <p className="text-gray-600">
                    Built with ❤️ using React & Node.js | {new Date().getFullYear()}
                </p>
            </div>
        </>
    )
}

export default Footer