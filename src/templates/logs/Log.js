export default function Log() {
    return (
        <Block for={logs} for-item="log">
            <Text className="log-item">{index + 1}. {log}</Text>
        </Block>
    )
}