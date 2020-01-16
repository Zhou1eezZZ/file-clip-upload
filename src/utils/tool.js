const calculateFileSize = size => {
    const kb = 1024
    const mb = kb * 1024
    const gb = mb * 1024
    const tb = gb * 1024
    if (size < 0.8 * kb) return size + 'B'
    if (size < 0.8 * mb) return (size / kb).toFixed(1) + 'Kb'
    if (size < 0.8 * gb) return (size / mb).toFixed(1) + 'Mb'
    if (size < 0.8 * tb) return (size / gb).toFixed(1) + 'Gb'
    return (size / gb).toFixed(1) + 'gb'
}

export { calculateFileSize }
