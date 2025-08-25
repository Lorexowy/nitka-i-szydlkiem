import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { User } from './firestore-types'

export class AuthService {
  
  // Rejestracja nowego użytkownika
  static async registerUser(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> {
    try {
      // Utwórz konto w Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Utwórz profil użytkownika w Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || null,
        photoURL: null,
        role: 'customer', // Domyślnie customer
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      // Zapisz w Firestore
      const userDoc = doc(db, 'users', firebaseUser.uid)
      await setDoc(userDoc, userData)

      return userData
    } catch (error: any) {
      console.error('Error registering user:', error)
      
      // Obsłuż specyficzne błędy Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Ten email jest już używany')
        case 'auth/weak-password':
          throw new Error('Hasło jest zbyt słabe')
        case 'auth/invalid-email':
          throw new Error('Nieprawidłowy format email')
        default:
          throw new Error('Nie udało się utworzyć konta')
      }
    }
  }

  // Logowanie użytkownika
  static async loginUser(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Pobierz dane użytkownika z Firestore
      const userData = await this.getUserData(firebaseUser.uid)
      if (!userData) {
        throw new Error('Nie znaleziono danych użytkownika')
      }

      return userData
    } catch (error: any) {
      console.error('Error logging in:', error)
      
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Nie znaleziono użytkownika z tym emailem')
        case 'auth/wrong-password':
          throw new Error('Nieprawidłowe hasło')
        case 'auth/invalid-email':
          throw new Error('Nieprawidłowy format email')
        case 'auth/too-many-requests':
          throw new Error('Zbyt dużo prób logowania. Spróbuj później')
        default:
          throw new Error('Nie udało się zalogować')
      }
    }
  }

  // Wylogowanie
  static async logoutUser(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error logging out:', error)
      throw new Error('Nie udało się wylogować')
    }
  }

  // Pobierz dane użytkownika z Firestore
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = doc(db, 'users', uid)
      const snapshot = await getDoc(userDoc)
      
      if (!snapshot.exists()) {
        return null
      }

      return {
        uid: snapshot.id,
        ...snapshot.data()
      } as User
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  // Sprawdź czy użytkownik jest adminem
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(uid)
      return userData?.role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Utwórz pierwszego admina (użyj tego raz, żeby stworzyć konto admin)
  static async createAdminUser(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      const adminData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || 'Administrator',
        photoURL: null,
        role: 'admin', // WAŻNE: rola admin
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const userDoc = doc(db, 'users', firebaseUser.uid)
      await setDoc(userDoc, adminData)

      return adminData
    } catch (error) {
      console.error('Error creating admin:', error)
      throw new Error('Nie udało się utworzyć konta administratora')
    }
  }

  // Hook do śledzenia stanu autoryzacji
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }
}