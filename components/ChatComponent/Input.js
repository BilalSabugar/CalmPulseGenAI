import { useState } from "react";

export const ChatInput = ({ onSend, palette }) => {

    const [text, setText] = useState('');
    const submit = () => {
        if (!text.trim()) return;
        onSend(e);
        setText('');
    };

    return (
        <View style={[S.inputContainer, { borderTopColor: palette.border }]}>
            <TextInput
                value={input}
                onChangeText={(e) => setInput(e.target.value)}
                onSubmitEditing={submit}
                placeholder="Type a message…"
                placeholderTextColor={palette.muted}
                style={[S.input, { borderColor: palette.border, backgroundColor: palette.ghost, color: palette.text }]}
            />
            <APressable onPress={submit} style={[S.sendBtn, { backgroundColor: palette.primary }]}>
                <MaterialIcons name="send" size={20} color="#fff" />
            </APressable>
        </View>
    );
}