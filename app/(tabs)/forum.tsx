import { useEffect, useState } from "react";
import { db, auth } from "../../firebaseConfig";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons"; // Added for icons

type ForumPost = {
  id: string;
  placeName: string;
  text: string;
  userName: string;
  userId: string;
  createdAt?: any;
};

export default function ForumScreen() {
  const [placeName, setPlaceName] = useState("");
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  // --- SUGGESTION STATES ---
  const [allSpaces, setAllSpaces] = useState<any[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- EDITING STATES ---
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPlaceName, setEditPlaceName] = useState("");
  const [editPostText, setEditPostText] = useState("");

  // 1. Dual Listener: Posts + Spaces for Autocomplete
  useEffect(() => {
    // Listen for Forum Posts
    const postsRef = collection(db, "forumPosts");
    const qPosts = query(postsRef, orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const loadedPosts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ForumPost, "id">),
      }));
      setPosts(loadedPosts);
      setLoading(false);
    });

    // Listen for Existing Spaces (to suggest names)
    const spacesRef = collection(db, "spaces");
    const unsubSpaces = onSnapshot(spacesRef, (snapshot) => {
      const spaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllSpaces(spaces);
    });

    return () => {
      unsubPosts();
      unsubSpaces();
    };
  }, []);

  // 2. Handle Text Input for Autocomplete
  const handlePlaceNameChange = (text: string) => {
    setPlaceName(text);
    if (text.trim().length > 0) {
      const filtered = allSpaces.filter((space: any) =>
        space.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setPlaceName(name);
    setShowSuggestions(false);
  };

  const handleAddPost = async () => {
    const trimmedPlace = placeName.trim();
    const trimmedText = postText.trim();
    if (!trimmedPlace || !trimmedText) {
      Alert.alert("Missing info", "Please enter the place name and your experience.");
      return;
    }

    try {
      await addDoc(collection(db, "forumPosts"), {
        placeName: trimmedPlace,
        text: trimmedText,
        userName: auth.currentUser?.email || "Anonymous",
        userId: auth.currentUser?.uid || "",
        createdAt: serverTimestamp(),
      });
      setPlaceName("");
      setPostText("");
      setShowSuggestions(false);
    } catch (error) {
      Alert.alert("Error", "Could not post right now.");
    }
  };

  // ... (Keep startEditing, cancelEditing, handleSaveEdit, handleDeletePost the same as your original) ...
  const startEditing = (post: ForumPost) => {
    setEditingPostId(post.id);
    setEditPlaceName(post.placeName);
    setEditPostText(post.text);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditPlaceName("");
    setEditPostText("");
  };

  const handleSaveEdit = async (postId: string) => {
    const trimmedPlace = editPlaceName.trim();
    const trimmedText = editPostText.trim();
    if (!trimmedPlace || !trimmedText) return;
    try {
      const postRef = doc(db, "forumPosts", postId);
      await updateDoc(postRef, { placeName: trimmedPlace, text: trimmedText });
      cancelEditing();
    } catch (error) { Alert.alert("Error", "Update failed."); }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert("Delete post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await deleteDoc(doc(db, "forumPosts", postId));
      }}
    ]);
  };

  const renderPost = ({ item }: { item: ForumPost }) => {
    const isOwner = item.userId === auth.currentUser?.uid;
    const isEditing = editingPostId === item.id;

    return (
      <View style={styles.postCard}>
        {isEditing ? (
          <>
            <TextInput style={styles.input} value={editPlaceName} onChangeText={setEditPlaceName} />
            <TextInput style={[styles.input, styles.textArea]} value={editPostText} onChangeText={setEditPostText} multiline />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.smallButton, styles.saveButton]} onPress={() => handleSaveEdit(item.id)}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, styles.cancelButton]} onPress={cancelEditing}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.placeName}>{item.placeName}</Text>
            <Text style={styles.userName}>Posted by: {item.userName}</Text>
            <Text style={styles.postText}>{item.text}</Text>
            {isOwner && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.smallButton, styles.editButton]} onPress={() => startEditing(item)}><Text style={styles.buttonText}>Edit</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => handleDeletePost(item.id)}><Text style={styles.buttonText}>Delete</Text></TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Forum</Text>
        <Text style={styles.subtitle}>Share your experience about a specific place.</Text>

        <View style={styles.inputContainer}>
          {/* PLACE NAME INPUT WITH SUGGESTIONS */}
          <View style={{ zIndex: 2000 }}> 
            <TextInput
              style={styles.input}
              placeholder="Enter place name"
              placeholderTextColor="#888"
              value={placeName}
              onChangeText={handlePlaceNameChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay so click registers
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <View style={styles.suggestionBox}>
                <ScrollView keyboardShouldPersistTaps="always" style={{ maxHeight: 150 }}>
                  {filteredSuggestions.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.suggestionItem} 
                      onPress={() => selectSuggestion(item.name)}
                    >
                      <Ionicons name="location-outline" size={16} color="#2D60FF" />
                      <Text style={styles.suggestionText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write about your experience..."
            placeholderTextColor="#888"
            value={postText}
            onChangeText={setPostText}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleAddPost}>
            <Text style={styles.buttonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {loading ? <Text>Loading posts...</Text> : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#333", marginBottom: 16 },
  inputContainer: { marginBottom: 20, zIndex: 1000 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: "#fff" },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  button: { backgroundColor: "#111", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  
  // --- NEW STYLES FOR SUGGESTIONS ---
  suggestionBox: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 3000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: { marginLeft: 10, fontSize: 14, color: '#333' },
  
  listContent: { paddingBottom: 30 },
  postCard: { backgroundColor: "#f4f4f4", borderRadius: 12, padding: 14, marginBottom: 12 },
  placeName: { fontSize: 17, fontWeight: "700", color: "#000", marginBottom: 4 },
  userName: { fontSize: 13, color: "#666", marginBottom: 8 },
  postText: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
  actionRow: { flexDirection: "row", marginTop: 8 },
  smallButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginRight: 10 },
  editButton: { backgroundColor: "#444" },
  deleteButton: { backgroundColor: "#b00020" },
  saveButton: { backgroundColor: "#111" },
  cancelButton: { backgroundColor: "#777" },
});