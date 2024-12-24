/// <reference types="cypress"/>

describe("Login Feature", () => { 
    beforeEach(() => {
        // Mengakses halaman login sebelum setiap test case
        cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login')
        cy.get('[class="oxd-text oxd-text--h5 orangehrm-login-title"]').should('have.text', 'Login')
    });

    it("TC_001: User login with valid credentials", () => {
        cy.get('[name="username"]').type('admin')
        cy.get('[name="password"]').type('admin123')

        const startTime = new Date().getTime()

        cy.intercept("GET", "**/employees/action-summary").as("actionSummery")
        cy.get('[type="submit"]').click()

        cy.wait("@actionSummery").then((intercept) => {
            expect(intercept.response.statusCode).to.equal(200)

            const endTime = new Date().getTime()
            const duration = endTime - startTime

            expect(duration).to.be.lessThan(5000)

            expect(intercept.response.body).to.have.property('data').and.to.be.an('array')

            expect(intercept.response.body.data[0]).to.have.property('group').and.to.be.equal('Pending Self Reviews')

            expect(intercept.response.body.data).to.have.length.greaterThan(0);

            intercept.response.body.data.forEach((item) => {
                expect(item).to.have.property('id').and.to.be.a('number');
                expect(item).to.have.property('group').and.to.be.a('string');
                expect(item).to.have.property('pendingActionCount').and.to.be.a('number');

            expect(intercept.response.body).to.have.property('meta').and.to.be.an('array');
            expect(intercept.response.body).to.have.property('rels').and.to.be.an('array');
            });

        })

        cy.get('[class="oxd-text oxd-text--h6 oxd-topbar-header-breadcrumb-module"]').should('have.text', 'Dashboard')
    });

    it("TC_002: User login with valid username and incorrect password", () => {
        cy.get('[name="username"]').type('admin')
        cy.get('[name="password"]').type('admin1234')

        const startTime = new Date().getTime()

        cy.intercept("GET", "**/core/i18n/messages").as("messagesIncorrectPassword")
        cy.get('[type="submit"]').click()

        cy.wait("@messagesIncorrectPassword").then((intercept) => {
            
            const endTime = new Date().getTime()
            const duration = endTime - startTime

            expect(intercept.response.statusCode).to.equal(304)

            expect(duration).to.be.lessThan(5000)
        })

        cy.get('[class="oxd-alert oxd-alert--error"]').should('contain', 'Invalid credentials')
    })

    it("TC_003: User login with incorrect username and valid password", () => {
        cy.get('[name="username"]').type('admin1')
        cy.get('[name="password"]').type('admin123')

        const startTime = new Date().getTime()

        cy.intercept("GET", "**/core/i18n/messages").as("messagesIncorrectUsername")
        cy.get('[type="submit"]').click()

        cy.wait("@messagesIncorrectUsername").then((intercept) => {
            
            const endTime = new Date().getTime()
            const duration = endTime - startTime

            expect(intercept.response.statusCode).to.equal(304)

            expect(duration).to.be.lessThan(5000)
        })

        cy.get('[class="oxd-alert oxd-alert--error"]').should('contain', 'Invalid credentials')
    })

    it("TC_004: User login with invalid credentials", () => {
        cy.get('[name="username"]').type('admin1')
        cy.get('[name="password"]').type('admin1234')

        const startTime = new Date().getTime()

        cy.intercept("GET", "**/core/i18n/messages").as("messagesInvalidCredentials")
        cy.get('[type="submit"]').click()

        cy.wait("@messagesInvalidCredentials").then((intercept) => {
            
            const endTime = new Date().getTime()
            const duration = endTime - startTime

            expect(intercept.response.statusCode).to.equal(304)

            expect(duration).to.be.lessThan(5000)
        })

        cy.get('[class="oxd-alert oxd-alert--error"]').should('contain', 'Invalid credentials')
    })

    // Ketika username atau password kosong, hanya perlu memvalidasi UI saja karena tidak mengirimkan permintaan ke endpoint(API)

    it("TC_005: User login with empty username and password", () => {
        cy.get('[type="submit"]').click()
        cy.get('[class="oxd-text oxd-text--span oxd-input-field-error-message oxd-input-group__message"]').should('contain', 'Required').and('be.visible')
    })

    it("TC_006: User login with empty username and valid password", () => {
        cy.get('[name="password"]').type('admin123')
        cy.get('[type="submit"]').click()
        cy.get('[class="oxd-text oxd-text--span oxd-input-field-error-message oxd-input-group__message"]').should('contain', 'Required').and('be.visible')
    })

    it("TC_007: User login with valid username and empty password", () => {
        cy.get('[name="username"]').type('admin')
        cy.get('[type="submit"]').click()
        cy.get('[class="oxd-text oxd-text--span oxd-input-field-error-message oxd-input-group__message"]').should('contain', 'Required').and('be.visible')
    })

    it("TC_008: User login with empty username and incorrect password", () => {
        cy.get('[name="password"]').type('admin1234')
        cy.get('[type="submit"]').click()
        cy.get('[class="oxd-text oxd-text--span oxd-input-field-error-message oxd-input-group__message"]').should('contain', 'Required').and('be.visible')
    })

    it("TC_009: User login with incorrect username and empty password", () => {
        cy.get('[name="username"]').type('admin1')
        cy.get('[type="submit"]').click()
        cy.get('[class="oxd-text oxd-text--span oxd-input-field-error-message oxd-input-group__message"]').should('contain', 'Required').and('be.visible')
    })

    it("TC_010: User navigates to Forgot Password page", () => {

        const startTime = new Date().getTime()

        cy.intercept("GET", "**/core/i18n/messages").as("messagesForgotPassword")
        cy.get('[class="oxd-text oxd-text--p orangehrm-login-forgot-header"]').click()

        cy.wait("@messagesForgotPassword").then((intercept) => {
            
            const endTime = new Date().getTime()
            const duration = endTime - startTime

            expect(intercept.response.statusCode).to.equal(304)

            expect(duration).to.be.lessThan(5000)
        })

        cy.url().should('include', '/requestPasswordResetCode')
        cy.get('[class="oxd-text oxd-text--h6 orangehrm-forgot-password-title"]').should('have.text', 'Reset Password')
    })

    it('TC_011: Reset password link sent successfully', () => {
        cy.get('[class="oxd-text oxd-text--p orangehrm-login-forgot-header"]').click()
        cy.url().should('include', '/requestPasswordResetCode')
        cy.get('[class="oxd-text oxd-text--h6 orangehrm-forgot-password-title"]').should('have.text', 'Reset Password')
        cy.get('[name="username"]').type('admin')

        const startTime = new Date().getTime()

        cy.intercept("GET", "**/core/i18n/messages").as("messagesForgotSuccess")
        cy.get('[type="submit"]').click()

        cy.wait("@messagesForgotSuccess").then((intercept) => {
            
            const endTime = new Date().getTime()
            const duration = endTime - startTime

            expect(intercept.response.statusCode).to.equal(304)

            expect(duration).to.be.lessThan(5000)
        })
        cy.get('[class="oxd-text oxd-text--h6 orangehrm-forgot-password-title"]').should('have.text','Reset Password link sent successfully')
    })

    it('TC_012: Reset password with empty username', () => {
        cy.get('[class="oxd-text oxd-text--p orangehrm-login-forgot-header"]').click()
        cy.url().should('include', '/requestPasswordResetCode')
        cy.get('[class="oxd-text oxd-text--h6 orangehrm-forgot-password-title"]').should('have.text', 'Reset Password')
        cy.get('[type="submit"]').click()
        cy.get('[class="oxd-text oxd-text--span oxd-input-field-error-message oxd-input-group__message"]').should('have.text','Required').and('be.visible')
    })

    it('TC_013: Cancel reset password', () => {
        cy.get('[class="oxd-text oxd-text--p orangehrm-login-forgot-header"]').click()
        cy.url().should('include', '/requestPasswordResetCode')

        const startTime = new Date().getTime()

        cy.intercept("GET", "**/core/i18n/messages").as("messagesCancelReset")
        cy.get('[type="button"]').click()

        cy.wait("@messagesCancelReset").then((intercept) => {
            
            const endTime = new Date().getTime()
            const duration = endTime - startTime

            expect(intercept.response.statusCode).to.equal(304)

            expect(duration).to.be.lessThan(5000)
        })

        cy.url().should('include', '/login')
        cy.get('[class="oxd-text oxd-text--h5 orangehrm-login-title"]').should('have.text', 'Login')
    })

})
