import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp 
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { User, UserProfile, Address } from './firestore-types'

export class AuthService {
  
  // Rejestracja nowego użytkownika
  static async registerUser(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Aktualizuj profil w Firebase Auth
      if (displayName) {
        await updateProfile(firebaseUser, { displayName })
      }

      // Utwórz profil użytkownika w Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || null,
        photoURL: null,
        role: 'customer',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const userDoc = doc(db, 'users', firebaseUser.uid)
      await setDoc(userDoc, userData)

      // Utwórz pusty profil użytkownika
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        preferences: {
          newsletter: true,
          smsNotifications: false,
          emailNotifications: true
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const profileDoc = doc(db, 'userProfiles', firebaseUser.uid)
      await setDoc(profileDoc, userProfile)

      return userData
    } catch (error: any) {
      console.error('Error registering user:', error)
      
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

  // Reset hasła
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Error sending password reset email:', error)
      
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Nie znaleziono użytkownika z tym emailem')
        case 'auth/invalid-email':
          throw new Error('Nieprawidłowy format email')
        default:
          throw new Error('Nie udało się wysłać emaila resetującego')
      }
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

  // Pobierz profil użytkownika
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const profileDoc = doc(db, 'userProfiles', uid)
      const snapshot = await getDoc(profileDoc)
      
      if (!snapshot.exists()) {
        return null
      }

      return {
        uid: snapshot.id,
        ...snapshot.data()
      } as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Aktualizuj profil użytkownika
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const profileDoc = doc(db, 'userProfiles', uid)
      
      await updateDoc(profileDoc, {
        ...updates,
        updatedAt: Timestamp.now()
      })

      // Jeśli aktualizujemy imię/nazwisko, zaktualizuj też displayName w users
      if (updates.firstName || updates.lastName) {
        const profile = await this.getUserProfile(uid)
        if (profile) {
          const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
          await this.updateUserData(uid, { displayName })
          
          // Aktualizuj też w Firebase Auth
          const currentUser = auth.currentUser
          if (currentUser && currentUser.uid === uid) {
            await updateProfile(currentUser, { displayName })
          }
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw new Error('Nie udało się zaktualizować profilu')
    }
  }

  // Aktualizuj dane użytkownika
  static async updateUserData(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const userDoc = doc(db, 'users', uid)
      
      await updateDoc(userDoc, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating user data:', error)
      throw new Error('Nie udało się zaktualizować danych użytkownika')
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

  // Utwórz pierwszego admina
  static async createAdminUser(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      if (displayName) {
        await updateProfile(firebaseUser, { displayName })
      }

      const adminData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || 'Administrator',
        photoURL: null,
        role: 'admin',
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

  // ZARZĄDZANIE ADRESAMI

  // Pobierz adresy użytkownika
  static async getUserAddresses(uid: string): Promise<Address[]> {
    try {
      const addressesCollection = collection(db, 'addresses')
      const q = query(addressesCollection, where('userId', '==', uid))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Address))
    } catch (error) {
      console.error('Error fetching user addresses:', error)
      return []
    }
  }

  // Dodaj adres użytkownika
  static async addUserAddress(addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const addressesCollection = collection(db, 'addresses')
      
      // Jeśli to pierwszy adres lub ma być domyślny, ustaw inne jako niedomyślne
      if (addressData.isDefault) {
        const existingAddresses = await this.getUserAddresses(addressData.userId)
        const defaultAddresses = existingAddresses.filter(addr => addr.isDefault)
        
        // Usuń domyślny status z innych adresów
        for (const addr of defaultAddresses) {
          await this.updateUserAddress(addr.id, { isDefault: false })
        }
      }

      const docRef = await setDoc(doc(addressesCollection), {
        ...addressData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      return docRef.id
    } catch (error) {
      console.error('Error adding address:', error)
      throw new Error('Nie udało się dodać adresu')
    }
  }

  // Aktualizuj adres użytkownika
  static async updateUserAddress(addressId: string, updates: Partial<Address>): Promise<void> {
    try {
      const addressDoc = doc(db, 'addresses', addressId)
      
      await updateDoc(addressDoc, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating address:', error)
      throw new Error('Nie udało się zaktualizować adresu')
    }
  }

  // Usuń adres użytkownika
  static async deleteUserAddress(addressId: string): Promise<void> {
    try {
      const addressDoc = doc(db, 'addresses', addressId)
      await deleteDoc(addressDoc)
    } catch (error) {
      console.error('Error deleting address:', error)
      throw new Error('Nie udało się usunąć adresu')
    }
  }

  // Pobierz domyślny adres użytkownika
  static async getDefaultAddress(uid: string, type: 'shipping' | 'billing'): Promise<Address | null> {
    try {
      const addresses = await this.getUserAddresses(uid)
      return addresses.find(addr => addr.type === type && addr.isDefault) || null
    } catch (error) {
      console.error('Error fetching default address:', error)
      return null
    }
  }

  // Ustaw adres jako domyślny
  static async setDefaultAddress(addressId: string, userId: string, type: 'shipping' | 'billing'): Promise<void> {
    try {
      // Usuń domyślny status z innych adresów tego typu
      const addresses = await this.getUserAddresses(userId)
      const sameTypeAddresses = addresses.filter(addr => addr.type === type && addr.isDefault)
      
      for (const addr of sameTypeAddresses) {
        await this.updateUserAddress(addr.id, { isDefault: false })
      }

      // Ustaw nowy adres jako domyślny
      await this.updateUserAddress(addressId, { isDefault: true })
    } catch (error) {
      console.error('Error setting default address:', error)
      throw new Error('Nie udało się ustawić domyślnego adresu')
    }
  }

  // Hook do śledzenia stanu autoryzacji
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Sprawdź czy email już istnieje
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const usersCollection = collection(db, 'users')
      const q = query(usersCollection, where('email', '==', email))
      const snapshot = await getDocs(q)
      
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking email existence:', error)
      return false
    }
  }

  // Pobierz statystyki użytkowników (dla admina)
  static async getUserStats(): Promise<{
    totalUsers: number
    totalCustomers: number
    totalAdmins: number
    recentUsers: User[]
  }> {
    try {
      const usersCollection = collection(db, 'users')
      const snapshot = await getDocs(usersCollection)
      
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User))

      const customers = users.filter(user => user.role === 'customer')
      const admins = users.filter(user => user.role === 'admin')

      // Ostatnich 5 użytkowników
      const recentUsers = users
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
        .slice(0, 5)

      return {
        totalUsers: users.length,
        totalCustomers: customers.length,
        totalAdmins: admins.length,
        recentUsers
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        totalUsers: 0,
        totalCustomers: 0,
        totalAdmins: 0,
        recentUsers: []
      }
    }
  }
}