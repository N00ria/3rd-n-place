import { useEffect, useState } from "react";
import { db, auth } from "../../firebaseConfig"; // db/login info
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

// what post looks like
type ForumPost = {
  id: string;
  placeName: string;
  text: string;
  userName: string;
  userId: string;
  createdAt?: any;
};

export default function ForumScreen() {
  // input for making a new post
  const [placeName, setPlaceName] = useState("");
  const [postText, setPostText] = useState("");

  
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  // editing a post
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPlaceName, setEditPlaceName] = useState("");
  const [editPostText, setEditPostText] = useState("");

  
  useEffect(() => {
    const postsRef = collection(db, "forumPosts"); 
    const q = query(postsRef, orderBy("createdAt", "desc")); // show newest post first

    // auto updates when things changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPosts: ForumPost[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ForumPost, "id">),
      }));
      setPosts(loadedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // add new post
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
    } catch (error) {
      console.log("Error adding post:", error);
      Alert.alert("Error", "Could not post right now.");
    }
  };

  // editing
  const startEditing = (post: ForumPost) => {
    setEditingPostId(post.id);
    setEditPlaceName(post.placeName);
    setEditPostText(post.text);
  };

  // cancel
  const cancelEditing = () => {
    setEditingPostId(null);
    setEditPlaceName("");
    setEditPostText("");
  };

  // save edited posts
  const handleSaveEdit = async (postId: string) => {
    const trimmedPlace = editPlaceName.trim();
    const trimmedText = editPostText.trim();

    if (!trimmedPlace || !trimmedText) {
      Alert.alert("Missing info", "Please enter the place name and your experience.");
      return;
    }

    try {
      const postRef = doc(db, "forumPosts", postId);
      await updateDoc(postRef, {
        placeName: trimmedPlace,
        text: trimmedText,
      });

      cancelEditing(); // exit editing
    } catch (error) {
      console.log("Error updating post:", error);
      Alert.alert("Error", "Could not update this post.");
    }
  };

  // delete post
  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      "Delete post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const postRef = doc(db, "forumPosts", postId);
              await deleteDoc(postRef);
            } catch (error) {
              console.log("Error deleting post:", error);
              Alert.alert("Error", "Could not delete this post.");
            }
          },
        },
      ]
    );
  };

  // how post looks
  const renderPost = ({ item }: { item: ForumPost }) => {
    const isOwner = item.userId === auth.currentUser?.uid;
    const isEditing = editingPostId === item.id; 

    return (
      <View style={styles.postCard}>
        {isEditing ? (
         
          <>
            <TextInput
              style={styles.input}
              value={editPlaceName}
              onChangeText={setEditPlaceName}
              placeholder="Enter place name"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editPostText}
              onChangeText={setEditPostText}
              placeholder="Edit your experience..."
              multiline
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.smallButton, styles.saveButton]}
                onPress={() => handleSaveEdit(item.id)}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallButton, styles.cancelButton]}
                onPress={cancelEditing}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.placeName}>{item.placeName}</Text>
            <Text style={styles.userName}>Posted by: {item.userName}</Text>
            <Text style={styles.postText}>{item.text}</Text>

            {isOwner && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.editButton]}
                  onPress={() => startEditing(item)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButton, styles.deleteButton]}
                  onPress={() => handleDeletePost(item.id)}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Forum</Text>
        <Text style={styles.subtitle}>
          Share your experience about a specific place.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter place name"
            placeholderTextColor="#888"
            value={placeName}
            onChangeText={setPlaceName}
          />

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


        {loading ? (
          <Text>Loading posts...</Text>
        ) : (
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
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#333",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 30,
  },
  postCard: {
    backgroundColor: "#f4f4f4",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  placeName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  userName: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  postText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#444",
  },
  deleteButton: {
    backgroundColor: "#b00020",
  },
  saveButton: {
    backgroundColor: "#111",
  },
  cancelButton: {
    backgroundColor: "#777",
  },
});