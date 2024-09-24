const bcrypt = require('bcryptjs');

async function testPasswordHashing() {
    const originalPassword = "Test1234"; // Replace with your test password
    const hashedPassword = await bcrypt.hash(originalPassword, 10);
    console.log("Hashed Password:", hashedPassword);

    const isMatch = await bcrypt.compare(originalPassword, hashedPassword);
    console.log("Password match result:", isMatch); // Should log true if the password matches
}

testPasswordHashing();
