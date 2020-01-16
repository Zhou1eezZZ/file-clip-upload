const transformComponentFiles = files => {
    return files
        .keys()
        .map(key => files(key).default)
        .filter(item => item.name)
}

export const registerGlobalComponent = (Vue, requireGlobalComponent) => {
    const components = transformComponentFiles(requireGlobalComponent)

    components.forEach(component => {
        const { name } = component
        Vue.component(name, component)
    })
}

export const registerLocalComponent = requireLocalComponent => {
    const localComponents = {}
    const components = transformComponentFiles(requireLocalComponent)

    components.forEach(item => {
        localComponents[item.name] = item
    })

    return localComponents
}
